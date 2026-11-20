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

//! Minimal WebDriver BiDi client used by pipe mode to capture screenshots and
//! subscribe to browser events while the binding drives the session over HTTP.

use anyhow::{Error, anyhow};
use futures_util::{SinkExt, StreamExt};
use serde_json::{Value, json};
use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::Message;

const COMMAND_TIMEOUT: Duration = Duration::from_secs(10);

pub type EventHandler = Arc<dyn Fn(&str, &Value) + Send + Sync>;
type Pending = Arc<Mutex<HashMap<u64, oneshot::Sender<Result<Value, Error>>>>>;

pub struct BiDiClient {
    outgoing: mpsc::UnboundedSender<Message>,
    pending: Pending,
    next_id: AtomicU64,
}

impl BiDiClient {
    pub async fn connect(url: &str, on_event: EventHandler) -> Result<Self, Error> {
        let (socket, _) = connect_async(url).await?;
        let (mut sink, mut stream) = socket.split();
        let (outgoing, mut queue) = mpsc::unbounded_channel::<Message>();
        let pending: Pending = Arc::new(Mutex::new(HashMap::new()));

        tokio::spawn(async move {
            while let Some(message) = queue.recv().await {
                let closing = matches!(message, Message::Close(_));
                if sink.send(message).await.is_err() || closing {
                    break;
                }
            }
        });

        let reader_pending = pending.clone();
        tokio::spawn(async move {
            while let Some(Ok(message)) = stream.next().await {
                if let Message::Text(text) = message {
                    dispatch(text.as_str(), &reader_pending, &on_event);
                }
            }
            for (_, waiter) in reader_pending.lock().unwrap().drain() {
                let _ = waiter.send(Err(anyhow!("BiDi connection closed")));
            }
        });

        Ok(BiDiClient {
            outgoing,
            pending,
            next_id: AtomicU64::new(1),
        })
    }

    pub async fn send_command(&self, method: &str, params: Value) -> Result<Value, Error> {
        let id = self.next_id.fetch_add(1, Ordering::SeqCst);
        let (waiter, response) = oneshot::channel();
        self.pending.lock().unwrap().insert(id, waiter);
        let command = json!({"id": id, "method": method, "params": params});
        if self
            .outgoing
            .send(Message::text(command.to_string()))
            .is_err()
        {
            self.pending.lock().unwrap().remove(&id);
            return Err(anyhow!("BiDi connection closed"));
        }
        match tokio::time::timeout(COMMAND_TIMEOUT, response).await {
            Ok(Ok(result)) => result,
            Ok(Err(_)) => Err(anyhow!("BiDi connection closed")),
            Err(_) => {
                self.pending.lock().unwrap().remove(&id);
                Err(anyhow!("BiDi command {} timed out", method))
            }
        }
    }

    pub async fn subscribe(&self, events: &[&str]) -> Result<(), Error> {
        self.send_command("session.subscribe", json!({"events": events}))
            .await
            .map(|_| ())
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

    pub fn close(&self) {
        let _ = self.outgoing.send(Message::Close(None));
    }
}

fn dispatch(text: &str, pending: &Pending, on_event: &EventHandler) {
    let Ok(message) = serde_json::from_str::<Value>(text) else {
        return;
    };
    match message["type"].as_str() {
        Some("event") => {
            if let Some(method) = message["method"].as_str() {
                on_event(method, &message["params"]);
            }
        }
        Some("success") | Some("error") => {
            let Some(id) = message["id"].as_u64() else {
                return;
            };
            let Some(waiter) = pending.lock().unwrap().remove(&id) else {
                return;
            };
            let result = if message["type"] == "success" {
                Ok(message["result"].clone())
            } else {
                Err(anyhow!(
                    "{}: {}",
                    message["error"].as_str().unwrap_or("unknown error"),
                    message["message"].as_str().unwrap_or_default()
                ))
            };
            let _ = waiter.send(result);
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio::net::TcpListener;
    use tokio_tungstenite::accept_async;

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
        let client = BiDiClient::connect(&url, handler).await.unwrap();

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
}
