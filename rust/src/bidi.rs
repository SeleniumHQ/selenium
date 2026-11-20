// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

//! WebDriver BiDi client used by pipe mode. It owns the session's single upstream connection:
//! the proxy sends its own commands (screenshots, subscriptions) through it, and the binding's
//! connections to the proxy are multiplexed over it, so both can use BiDi at the same time.

use crate::bidi_router::{ContextTree, Subscriptions, subscription_from};
use anyhow::{Error, anyhow};
use futures_util::{SinkExt, StreamExt};
use serde_json::{Value, json};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tokio_tungstenite::tungstenite::http::{HeaderName, HeaderValue};

const COMMAND_TIMEOUT: Duration = Duration::from_secs(10);

pub type EventHandler = Arc<dyn Fn(&str, &Value) + Send + Sync>;

/// Messages for one downstream connection, in the order they must be written. Each slot is
/// filled when its message is ready (`None`: nothing to write), so a response held back (e.g.
/// while a screenshot is taken) does not let later events overtake it.
pub type Outgoing = mpsc::UnboundedSender<oneshot::Receiver<Option<String>>>;

/// Response of the remote end to a downstream command, with the binding's id restored.
pub struct Response {
    pub message: Value,
    slot: oneshot::Sender<Option<String>>,
}

impl Response {
    /// Writes the (possibly edited) message to the downstream connection.
    pub fn deliver(self) {
        let _ = self.slot.send(Some(self.message.to_string()));
    }
}

enum Origin {
    Internal(oneshot::Sender<Result<Value, Error>>),
    Downstream {
        conn: u64,
        id: Value,
        method: String,
        params: Value,
        reply: oneshot::Sender<Response>,
    },
}

struct Downstream {
    out: Outgoing,
    subscriptions: Subscriptions,
}

#[derive(Default)]
struct Router {
    pending: Mutex<HashMap<u64, Origin>>,
    downstream: Mutex<HashMap<u64, Downstream>>,
    tree: Mutex<ContextTree>,
    own_events: Mutex<Vec<String>>,
    legacy_unsubscribe: AtomicBool,
}

pub struct BiDiClient {
    outgoing: mpsc::UnboundedSender<Message>,
    router: Arc<Router>,
    next_id: AtomicU64,
    next_conn: AtomicU64,
}

impl BiDiClient {
    pub async fn connect(
        url: &str,
        headers: &[(String, String)],
        on_event: EventHandler,
    ) -> Result<Self, Error> {
        let mut request = url.into_client_request()?;
        for (name, value) in headers {
            request.headers_mut().insert(
                HeaderName::from_bytes(name.as_bytes())?,
                HeaderValue::from_str(value)?,
            );
        }
        let (socket, _) = connect_async(request).await?;
        let (mut sink, mut stream) = socket.split();
        let (outgoing, mut queue) = mpsc::unbounded_channel::<Message>();
        let router = Arc::new(Router::default());

        tokio::spawn(async move {
            while let Some(message) = queue.recv().await {
                let closing = matches!(message, Message::Close(_));
                if sink.send(message).await.is_err() || closing {
                    break;
                }
            }
        });

        let reader = router.clone();
        tokio::spawn(async move {
            while let Some(Ok(message)) = stream.next().await {
                if let Message::Text(text) = message {
                    reader.dispatch(text.as_str(), &on_event);
                }
            }
            for (_, origin) in reader.pending.lock().unwrap().drain() {
                if let Origin::Internal(waiter) = origin {
                    let _ = waiter.send(Err(anyhow!("BiDi connection closed")));
                }
            }
            // Dropping the senders closes the downstream connections.
            reader.downstream.lock().unwrap().clear();
        });

        Ok(BiDiClient {
            outgoing,
            router,
            next_id: AtomicU64::new(1),
            next_conn: AtomicU64::new(1),
        })
    }

    pub async fn send_command(&self, method: &str, params: Value) -> Result<Value, Error> {
        let (waiter, response) = oneshot::channel();
        let id = self.send(Origin::Internal(waiter), method, params)?;
        match tokio::time::timeout(COMMAND_TIMEOUT, response).await {
            Ok(Ok(result)) => result,
            Ok(Err(_)) => Err(anyhow!("BiDi connection closed")),
            Err(_) => {
                self.router.pending.lock().unwrap().remove(&id);
                Err(anyhow!("BiDi command {} timed out", method))
            }
        }
    }

    fn send(&self, origin: Origin, method: &str, params: Value) -> Result<u64, Error> {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        self.router.pending.lock().unwrap().insert(id, origin);
        let command = json!({"id": id, "method": method, "params": params});
        if self
            .outgoing
            .send(Message::text(command.to_string()))
            .is_err()
        {
            self.router.pending.lock().unwrap().remove(&id);
            return Err(anyhow!("BiDi connection closed"));
        }
        Ok(id)
    }

    /// Subscribes the proxy itself; returns the subscription id (empty if the remote end
    /// does not return one).
    pub async fn subscribe(&self, events: &[&str]) -> Result<String, Error> {
        let result = self
            .send_command("session.subscribe", json!({"events": events}))
            .await?;
        let mut own = self.router.own_events.lock().unwrap();
        own.extend(events.iter().map(|e| e.to_string()));
        own.dedup();
        Ok(result["subscription"]
            .as_str()
            .unwrap_or_default()
            .to_string())
    }

    /// Captures the viewport of the given browsing context (WebDriver window handle).
    pub async fn capture_screenshot(&self, context: &str) -> Result<String, Error> {
        let result = self
            .send_command(
                "browsingContext.captureScreenshot",
                json!({"context": context}),
            )
            .await?;
        result["data"]
            .as_str()
            .map(str::to_string)
            .ok_or_else(|| anyhow!("BiDi screenshot without data"))
    }

    /// Registers a downstream connection; returns its id for `forward` and `detach`.
    pub fn attach(&self, out: Outgoing) -> u64 {
        let conn = self.next_conn.fetch_add(1, Ordering::SeqCst);
        let downstream = Downstream {
            out,
            subscriptions: Subscriptions::new(),
        };
        self.router
            .downstream
            .lock()
            .unwrap()
            .insert(conn, downstream);
        conn
    }

    pub fn detach(&self, conn: u64) {
        self.router.downstream.lock().unwrap().remove(&conn);
    }

    /// Sends a command of a downstream connection upstream under a fresh id. The returned
    /// receiver gets the remote end's response once its turn in the connection has come.
    pub fn forward(&self, conn: u64, message: Value) -> Result<oneshot::Receiver<Response>, Error> {
        let id = message
            .get("id")
            .filter(|id| id.is_u64())
            .ok_or_else(|| anyhow!("BiDi command without id"))?
            .clone();
        let method = message["method"]
            .as_str()
            .ok_or_else(|| anyhow!("BiDi command without method"))?
            .to_string();
        let params = message["params"].clone();
        let (reply, response) = oneshot::channel();
        let origin = Origin::Downstream {
            conn,
            id,
            method: method.clone(),
            params: params.clone(),
            reply,
        };
        self.send(origin, &method, params)?;
        Ok(response)
    }

    /// Whether a downstream `session.unsubscribe` by event names (the legacy form) covered
    /// events the proxy subscribed to since the last call; the remote end may have dropped the
    /// proxy's subscription too.
    pub fn take_legacy_unsubscribe(&self) -> bool {
        self.router.legacy_unsubscribe.swap(false, Ordering::SeqCst)
    }

    pub fn close(&self) {
        let _ = self.outgoing.send(Message::Close(None));
    }
}

impl Router {
    fn dispatch(&self, text: &str, on_event: &EventHandler) {
        let Ok(mut message) = serde_json::from_str::<Value>(text) else {
            return;
        };
        match message["type"].as_str() {
            Some("event") => {
                let Some(method) = message["method"].as_str() else {
                    return;
                };
                let params = &message["params"];
                on_event(method, params);
                let mut tree = self.tree.lock().unwrap();
                tree.on_event(method, params);
                for downstream in self.downstream.lock().unwrap().values() {
                    if downstream.subscriptions.delivers(method, params, &tree) {
                        let (slot, filled) = oneshot::channel();
                        let _ = slot.send(Some(text.to_string()));
                        let _ = downstream.out.send(filled);
                    }
                }
            }
            Some("success") | Some("error") => {
                let Some(id) = message["id"].as_u64() else {
                    return;
                };
                let Some(origin) = self.pending.lock().unwrap().remove(&id) else {
                    return;
                };
                match origin {
                    Origin::Internal(waiter) => {
                        let _ = waiter.send(result_of(&message));
                    }
                    Origin::Downstream {
                        conn,
                        id,
                        method,
                        params,
                        reply,
                    } => {
                        let mut downstream = self.downstream.lock().unwrap();
                        let Some(target) = downstream.get_mut(&conn) else {
                            return;
                        };
                        if message["type"] == "success" {
                            self.track_subscriptions(target, &method, &params, &message["result"]);
                        }
                        let (slot, filled) = oneshot::channel();
                        if target.out.send(filled).is_ok() {
                            message["id"] = id;
                            let _ = reply.send(Response { message, slot });
                        }
                    }
                }
            }
            _ => {}
        }
    }

    fn track_subscriptions(
        &self,
        target: &mut Downstream,
        method: &str,
        params: &Value,
        result: &Value,
    ) {
        match method {
            "session.subscribe" => {
                if let Some(sub) = subscription_from(params, result) {
                    target.subscriptions.add(sub);
                }
            }
            "session.unsubscribe" => {
                let strings = |value: &Value| -> Vec<String> {
                    value
                        .as_array()
                        .map(|items| {
                            items
                                .iter()
                                .filter_map(|item| item.as_str().map(str::to_string))
                                .collect()
                        })
                        .unwrap_or_default()
                };
                target
                    .subscriptions
                    .remove_ids(&strings(&params["subscriptions"]));
                let events = strings(&params["events"]);
                if !events.is_empty() {
                    target.subscriptions.remove_events(&events);
                    let own = self.own_events.lock().unwrap();
                    if events.iter().any(|event| own.contains(event)) {
                        self.legacy_unsubscribe.store(true, Ordering::SeqCst);
                    }
                }
            }
            _ => {}
        }
    }
}

fn result_of(message: &Value) -> Result<Value, Error> {
    if message["type"] == "success" {
        Ok(message["result"].clone())
    } else {
        Err(anyhow!(
            "{}: {}",
            message["error"].as_str().unwrap_or("unknown error"),
            message["message"].as_str().unwrap_or_default()
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::net::TcpListener;
    use tokio_tungstenite::tungstenite::handshake::server::{
        Request, Response as HandshakeResponse,
    };
    use tokio_tungstenite::{accept_async, accept_hdr_async};

    /// Fake BiDi endpoint: answers every command and emits one console event after subscribing.
    async fn fake_bidi_server() -> String {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("ws://{}", listener.local_addr().unwrap());
        tokio::spawn(async move {
            let (stream, _) = listener.accept().await.unwrap();
            let mut socket = accept_async(stream).await.unwrap();
            while let Some(Ok(Message::Text(text))) = socket.next().await {
                let command: Value = serde_json::from_str(text.as_str()).unwrap();
                let id = command["id"].clone();
                let reply = match command["method"].as_str().unwrap() {
                    "browsingContext.captureScreenshot" => {
                        json!({"type": "success", "id": id, "result": {"data": "iVBORw0KGgo="}})
                    }
                    "session.subscribe" => json!({"type": "success", "id": id, "result": {}}),
                    _ => {
                        json!({"type": "error", "id": id, "error": "unknown command", "message": "nope"})
                    }
                };
                socket.send(Message::text(reply.to_string())).await.unwrap();
                if command["method"] == "session.subscribe" {
                    let event = json!({"type": "event", "method": "log.entryAdded", "params": {"text": "hello"}});
                    socket.send(Message::text(event.to_string())).await.unwrap();
                }
            }
        });
        url
    }

    #[tokio::test]
    async fn sends_commands_and_receives_events() {
        let url = fake_bidi_server().await;
        let (events_tx, mut events_rx) = mpsc::unbounded_channel::<(String, Value)>();
        let handler: EventHandler = Arc::new(move |method, params| {
            let _ = events_tx.send((method.to_string(), params.clone()));
        });
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();

        assert_eq!(
            client.capture_screenshot("ctx").await.unwrap(),
            "iVBORw0KGgo="
        );
        client.subscribe(&["log.entryAdded"]).await.unwrap();
        let (method, params) = tokio::time::timeout(Duration::from_secs(5), events_rx.recv())
            .await
            .unwrap()
            .unwrap();
        assert_eq!(method, "log.entryAdded");
        assert_eq!(params["text"], "hello");

        let error = client
            .send_command("bogus.command", json!({}))
            .await
            .unwrap_err();
        assert!(error.to_string().contains("unknown command"));
        client.close();
    }

    /// Fake upstream BiDi endpoint for multiplexing tests. It remembers the `Authorization`
    /// header of the handshake, numbers subscriptions, emits a console event after each
    /// navigation and closes the connection on `test.close`.
    async fn fake_upstream() -> (String, Arc<Mutex<Option<String>>>) {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("ws://{}", listener.local_addr().unwrap());
        let authorization = Arc::new(Mutex::new(None));
        let seen = authorization.clone();
        tokio::spawn(async move {
            let (stream, _) = listener.accept().await.unwrap();
            let callback = |request: &Request, response: HandshakeResponse| {
                *seen.lock().unwrap() = request
                    .headers()
                    .get("Authorization")
                    .and_then(|v| v.to_str().ok())
                    .map(str::to_string);
                Ok(response)
            };
            let mut socket = accept_hdr_async(stream, callback).await.unwrap();
            let mut subscriptions = 0;
            while let Some(Ok(Message::Text(text))) = socket.next().await {
                let command: Value = serde_json::from_str(text.as_str()).unwrap();
                let id = command["id"].clone();
                let method = command["method"].as_str().unwrap().to_string();
                if method == "test.close" {
                    break;
                }
                let result = if method == "session.subscribe" {
                    subscriptions += 1;
                    json!({"subscription": format!("sub-{}", subscriptions)})
                } else {
                    json!({"echo": method})
                };
                let reply = json!({"type": "success", "id": id, "result": result});
                socket.send(Message::text(reply.to_string())).await.unwrap();
                if method == "browsingContext.navigate" {
                    let event = json!({"type": "event", "method": "log.entryAdded",
                        "params": {"text": "hello", "source": {"context": "top"}}});
                    socket.send(Message::text(event.to_string())).await.unwrap();
                }
            }
        });
        (url, authorization)
    }

    fn recorded_events() -> (EventHandler, mpsc::UnboundedReceiver<String>) {
        let (events_tx, events_rx) = mpsc::unbounded_channel::<String>();
        let handler: EventHandler = Arc::new(move |method, _| {
            let _ = events_tx.send(method.to_string());
        });
        (handler, events_rx)
    }

    /// Next message a downstream connection would write, skipping dropped slots.
    async fn next_downstream(
        queue: &mut mpsc::UnboundedReceiver<oneshot::Receiver<Option<String>>>,
        wait: Duration,
    ) -> Option<Value> {
        loop {
            let slot = tokio::time::timeout(wait, queue.recv()).await.ok()??;
            if let Ok(Some(text)) = slot.await {
                return serde_json::from_str(&text).ok();
            }
        }
    }

    async fn forward_and_deliver(client: &BiDiClient, conn: u64, command: Value) {
        let response = client.forward(conn, command).unwrap();
        tokio::time::timeout(WAIT, response)
            .await
            .unwrap()
            .unwrap()
            .deliver();
    }

    const QUIET: Duration = Duration::from_millis(300);
    const WAIT: Duration = Duration::from_secs(5);

    #[tokio::test]
    async fn downstream_ids_are_restored() {
        let (url, _) = fake_upstream().await;
        let (handler, _events) = recorded_events();
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();
        client.subscribe(&["log.entryAdded"]).await.unwrap();
        let (out, mut queue) = mpsc::unbounded_channel();
        let conn = client.attach(out);

        let command = json!({"id": 1, "method": "browsingContext.getTree", "params": {}});
        forward_and_deliver(&client, conn, command).await;
        let reply = next_downstream(&mut queue, WAIT).await.unwrap();
        assert_eq!(reply["id"], 1);
        assert_eq!(reply["result"]["echo"], "browsingContext.getTree");
        assert!(next_downstream(&mut queue, QUIET).await.is_none());
        assert!(
            client
                .forward(conn, json!({"method": "session.status"}))
                .is_err()
        );
    }

    #[tokio::test]
    async fn two_downstream_connections_keep_their_own_ids() {
        let (url, _) = fake_upstream().await;
        let (handler, _events) = recorded_events();
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();
        let (first_out, mut first) = mpsc::unbounded_channel();
        let (second_out, mut second) = mpsc::unbounded_channel();
        let first_conn = client.attach(first_out);
        let second_conn = client.attach(second_out);

        let status = json!({"id": 1, "method": "session.status", "params": {}});
        forward_and_deliver(&client, first_conn, status.clone()).await;
        forward_and_deliver(&client, second_conn, status).await;
        assert_eq!(next_downstream(&mut first, WAIT).await.unwrap()["id"], 1);
        assert_eq!(next_downstream(&mut second, WAIT).await.unwrap()["id"], 1);
        assert!(next_downstream(&mut first, QUIET).await.is_none());
        assert!(next_downstream(&mut second, QUIET).await.is_none());
    }

    #[tokio::test]
    async fn events_only_reach_subscribed_connections() {
        let (url, _) = fake_upstream().await;
        let (handler, mut events) = recorded_events();
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();
        let (out, mut queue) = mpsc::unbounded_channel();
        let conn = client.attach(out);
        let navigate = json!({"id": 1, "method": "browsingContext.navigate",
            "params": {"context": "top", "url": "about:blank"}});

        forward_and_deliver(&client, conn, navigate.clone()).await;
        assert_eq!(next_downstream(&mut queue, WAIT).await.unwrap()["id"], 1);
        assert_eq!(events.recv().await.unwrap(), "log.entryAdded");
        assert!(next_downstream(&mut queue, QUIET).await.is_none());

        let subscribe = json!({"id": 2, "method": "session.subscribe",
            "params": {"events": ["log"]}});
        forward_and_deliver(&client, conn, subscribe).await;
        assert_eq!(next_downstream(&mut queue, WAIT).await.unwrap()["id"], 2);
        forward_and_deliver(&client, conn, navigate).await;
        assert_eq!(next_downstream(&mut queue, WAIT).await.unwrap()["id"], 1);
        let event = next_downstream(&mut queue, WAIT).await.unwrap();
        assert_eq!(event["method"], "log.entryAdded");
    }

    #[tokio::test]
    async fn legacy_unsubscribe_of_own_events_is_reported() {
        let (url, _) = fake_upstream().await;
        let (handler, _events) = recorded_events();
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();
        client.subscribe(&["log.entryAdded"]).await.unwrap();
        let (out, _queue) = mpsc::unbounded_channel();
        let conn = client.attach(out);

        let by_id = json!({"id": 1, "method": "session.unsubscribe",
            "params": {"subscriptions": ["sub-9"]}});
        forward_and_deliver(&client, conn, by_id).await;
        assert!(!client.take_legacy_unsubscribe());
        let by_events = json!({"id": 2, "method": "session.unsubscribe",
            "params": {"events": ["log.entryAdded"]}});
        forward_and_deliver(&client, conn, by_events).await;
        assert!(client.take_legacy_unsubscribe());
        assert!(!client.take_legacy_unsubscribe());
    }

    #[tokio::test]
    async fn closing_upstream_closes_downstream() {
        let (url, _) = fake_upstream().await;
        let (handler, _events) = recorded_events();
        let client = BiDiClient::connect(&url, &[], handler).await.unwrap();
        let (out, mut queue) = mpsc::unbounded_channel();
        client.attach(out);
        let _ = client.send_command("test.close", json!({})).await;
        let closed = tokio::time::timeout(WAIT, queue.recv()).await.unwrap();
        assert!(closed.is_none());
    }

    #[tokio::test]
    async fn handshake_carries_headers() {
        let (url, authorization) = fake_upstream().await;
        let (handler, _events) = recorded_events();
        let headers = [("Authorization".to_string(), "Basic dTpw".to_string())];
        let client = BiDiClient::connect(&url, &headers, handler).await.unwrap();
        client.subscribe(&["log.entryAdded"]).await.unwrap();
        assert_eq!(authorization.lock().unwrap().as_deref(), Some("Basic dTpw"));
    }
}
