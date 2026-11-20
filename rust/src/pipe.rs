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

//! Pipe mode: Selenium Manager starts the driver and exposes a local HTTP proxy in front of it.
//! Bindings send their regular WebDriver traffic to the proxy, which can record the session
//! (commands, screenshots, console and network activity) into a trace archive.
//!
//! When recording, the proxy asks the driver for a WebDriver BiDi connection (`webSocketUrl`).
//! BiDi provides standard screenshots, console messages and network events; without it the
//! proxy falls back to classic WebDriver. The proxy owns that connection and, if the binding
//! asked for BiDi too, serves its own WebSocket endpoint and multiplexes the binding over it.

use crate::archiver;
use crate::bidi::{BiDiClient, EventHandler, Outgoing};
use crate::logger::Logger;
use crate::recorder::{Recording, redact_key_actions};
use anyhow::{Error, anyhow};
use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use futures_util::stream::FuturesUnordered;
use futures_util::{SinkExt, StreamExt};
use reqwest::Client;
use serde_json::{Value, json};
use std::future::Future;
use std::io::Write;
use std::net::SocketAddr;
use std::path::{Path, PathBuf};
use std::pin::Pin;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};
use tokio::net::TcpListener;
use tokio::sync::{mpsc, oneshot};
use tokio_tungstenite::WebSocketStream;
use tokio_tungstenite::tungstenite::Message;
use tokio_tungstenite::tungstenite::handshake::derive_accept_key;
use tokio_tungstenite::tungstenite::protocol::Role;

const DRIVER_STARTUP_TIMEOUT: Duration = Duration::from_secs(30);
const POLL_INTERVAL: Duration = Duration::from_millis(100);
const MAX_HEADER_BYTES: usize = 64 * 1024;
// Browsing context events let the proxy tell which events belong to a binding's subscriptions.
const BIDI_EVENTS: &[&str] = &[
    "log.entryAdded",
    "network.responseCompleted",
    "browsingContext.contextCreated",
    "browsingContext.contextDestroyed",
];
const PASSWORD_FOCUSED_SCRIPT: &str =
    "return !!document.activeElement && document.activeElement.type === 'password'";

static SHUTDOWN_REQUESTED: AtomicBool = AtomicBool::new(false);

pub struct PipeOptions {
    pub driver_path: PathBuf,
    pub browser_name: String,
    pub language_binding: String,
    pub record_path: Option<PathBuf>,
}

/// Runs pipe mode until the session is deleted or the process receives SIGINT/SIGTERM.
pub fn run(options: PipeOptions, log: &Logger) -> Result<(), Error> {
    install_signal_handlers();
    let runtime = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()?;
    runtime.block_on(run_async(options, log))
}

async fn run_async(options: PipeOptions, log: &Logger) -> Result<(), Error> {
    log.debug(format!(
        "Starting driver in pipe mode: {}",
        options.driver_path.display()
    ));
    let mut driver = DriverProcess::start(&options.driver_path).await?;
    log.debug(format!("Driver ready at {}", driver.base_url));

    let recording = options.record_path.as_ref().map(|path| {
        log.debug(format!("Recording session to {}", path.display()));
        Recording::new(
            path.clone(),
            &options.browser_name,
            &options.language_binding,
        )
    });
    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let proxy_addr = listener.local_addr()?;
    let state = Arc::new(ProxyState::new(
        driver.base_url.clone(),
        recording,
        proxy_addr,
    ));
    let proxy_url = format!("http://{}", proxy_addr);
    tokio::spawn(accept_loop(listener, state.clone()));

    // A single JSON line lets bindings discover the proxy while this process keeps running.
    let ready = json!({"proxy_url": proxy_url, "driver_path": options.driver_path});
    let mut stdout = std::io::stdout();
    writeln!(stdout, "{}", ready)?;
    stdout.flush()?;
    log.debug(format!("Pipe mode proxy listening at {}", proxy_url));

    while !state.session_ended.load(Ordering::SeqCst) && !SHUTDOWN_REQUESTED.load(Ordering::SeqCst)
    {
        state.drain_diagnostics(log);
        tokio::time::sleep(POLL_INTERVAL).await;
    }

    if !state.session_ended.load(Ordering::SeqCst) {
        log.debug("Shutdown requested before the session was deleted");
        state.abandon_session().await;
    }
    state.drain_diagnostics(log);
    match state.saved_trace() {
        Some(Ok(path)) => log.info(format!("Trace saved to {}", path.display())),
        Some(Err(err)) => {
            log.warn(format!("Unable to save trace: {}", err));
            // Bindings read this line to tell their users, since quitting itself succeeded.
            writeln!(stdout, "{}", trace_error_line(&err))?;
            stdout.flush()?;
        }
        None => {}
    }
    driver.stop();
    Ok(())
}

async fn accept_loop(listener: TcpListener, state: Arc<ProxyState>) {
    loop {
        match listener.accept().await {
            Ok((stream, _)) => {
                let state = state.clone();
                tokio::spawn(async move {
                    let mut stream = stream;
                    if let Err(err) = state.handle_connection(&mut stream).await {
                        state.diagnostic(format!("Proxy request failed: {}", err));
                    }
                });
            }
            Err(err) => state.diagnostic(format!("Proxy accept failed: {}", err)),
        }
    }
}

struct ProxyState {
    webdriver_url: String,
    proxy_addr: SocketAddr,
    client: Client,
    recording: Option<Arc<Mutex<Recording>>>,
    bidi: Mutex<Option<Arc<BiDiClient>>>,
    session_id: Mutex<Option<String>>,
    // Commands are handled one at a time so screenshots match the command that triggered them.
    command_lock: tokio::sync::Mutex<()>,
    session_ended: AtomicBool,
    trace_result: Mutex<Option<Result<PathBuf, String>>>,
    diagnostics: Mutex<Vec<(bool, String)>>,
}

impl ProxyState {
    fn new(webdriver_url: String, recording: Option<Recording>, proxy_addr: SocketAddr) -> Self {
        ProxyState {
            webdriver_url,
            proxy_addr,
            client: local_http_client(),
            recording: recording.map(|r| Arc::new(Mutex::new(r))),
            bidi: Mutex::new(None),
            session_id: Mutex::new(None),
            command_lock: tokio::sync::Mutex::new(()),
            session_ended: AtomicBool::new(false),
            trace_result: Mutex::new(None),
            diagnostics: Mutex::new(Vec::new()),
        }
    }

    async fn handle_connection<S>(&self, stream: &mut S) -> Result<(), Error>
    where
        S: AsyncRead + AsyncWrite + Unpin,
    {
        let Some(request) = read_request(stream).await? else {
            return Ok(());
        };
        let route = Route::parse(&request.method, &request.path);
        if let Some(session_id) = route.bidi_session() {
            // WebSocket connections live as long as the session; they must not hold the lock.
            return self.serve_bidi(stream, &request, session_id).await;
        }
        let _guard = self.command_lock.lock().await;

        let mut body = request.body;
        let mut binding_wants_bidi = false;
        if route.is_new_session() && self.recording.is_some() {
            let (patched, wanted) = request_bidi(&body);
            body = patched;
            binding_wants_bidi = wanted;
        }
        if route.is_delete_session() {
            self.collect_classic_logs().await;
        }

        let action = self.recording.as_ref().and_then(|rec| {
            route.recordable().then(|| {
                rec.lock()
                    .unwrap()
                    .start_action(&request.method, &route.command_path, &body)
            })
        });
        if let (Some(index), Some(element_id)) = (action, route.typed_element())
            && self.is_password_field(element_id).await
            && let Some(rec) = &self.recording
        {
            rec.lock().unwrap().redact_typed_text(index);
        }
        if let (Some(index), Some(rec)) = (action, &self.recording)
            && route.is_actions()
            && self.password_field_focused().await
        {
            let mut rec = rec.lock().unwrap();
            if let Some(recorded) = rec.actions[index].request_body.as_mut() {
                redact_key_actions(recorded);
            }
        }

        let (status, content_type, mut response_body) = match self
            .forward(&request.method, &request.path, &request.headers, body)
            .await
        {
            Ok(response) => response,
            Err(err) => {
                let error = json!({"value": {"error": "unknown error",
                        "message": format!("Selenium Manager proxy could not reach the driver: {}", err)}});
                (
                    502,
                    "application/json".to_string(),
                    error.to_string().into_bytes(),
                )
            }
        };

        if route.is_new_session() && status == 200 {
            let authorization = request
                .headers
                .iter()
                .filter(|(name, _)| name.eq_ignore_ascii_case("authorization"))
                .cloned()
                .collect::<Vec<_>>();
            response_body = self
                .on_session_created(response_body, binding_wants_bidi, &authorization)
                .await;
        }
        if let (Some(rec), Some(index)) = (&self.recording, action) {
            rec.lock()
                .unwrap()
                .end_action(index, status, &response_body);
        }
        if route.is_delete_session() {
            // The trace must be on disk before the binding sees the session as closed,
            // since bindings may terminate this process right after quitting.
            self.finish_recording();
        }

        write_response(stream, status, &content_type, &response_body).await?;
        stream.flush().await?;

        if route.is_delete_session() {
            self.session_ended.store(true, Ordering::SeqCst);
        } else if let Some(index) = action {
            let visual = self
                .recording
                .as_ref()
                .is_some_and(|rec| rec.lock().unwrap().actions[index].info.visual);
            if visual && status < 400 {
                self.capture_screenshot(index).await;
                if !self.has_bidi() {
                    self.collect_classic_logs().await;
                }
            }
        }
        Ok(())
    }

    async fn forward(
        &self,
        method: &str,
        path: &str,
        headers: &[(String, String)],
        body: Vec<u8>,
    ) -> Result<(u16, String, Vec<u8>), Error> {
        let method = reqwest::Method::from_bytes(method.as_bytes())?;
        let mut request = self
            .client
            .request(method, format!("{}{}", self.webdriver_url, path));
        for (name, value) in headers {
            if !is_hop_by_hop(name) {
                request = request.header(name, value);
            }
        }
        let response = request.body(body).send().await?;
        let status = response.status().as_u16();
        let content_type = response
            .headers()
            .get(reqwest::header::CONTENT_TYPE)
            .and_then(|v| v.to_str().ok())
            .unwrap_or("application/json; charset=utf-8")
            .to_string();
        Ok((status, content_type, response.bytes().await?.to_vec()))
    }

    async fn on_session_created(
        &self,
        response_body: Vec<u8>,
        binding_wants_bidi: bool,
        headers: &[(String, String)],
    ) -> Vec<u8> {
        let Ok(mut response) = serde_json::from_slice::<Value>(&response_body) else {
            return response_body;
        };
        let session_id = response["value"]["sessionId"].as_str().map(str::to_string);
        *self.session_id.lock().unwrap() = session_id.clone();
        if let Some(rec) = &self.recording {
            rec.lock().unwrap().session_id = session_id.clone();
        }
        if self.recording.is_none() {
            return response_body;
        }

        // Connected before replying, since the binding may open its BiDi connection right away.
        let capabilities = &mut response["value"]["capabilities"];
        let connected = match capabilities["webSocketUrl"].as_str().map(str::to_string) {
            Some(url) => self.connect_bidi(&url, headers).await,
            None => {
                self.warning("Driver did not return webSocketUrl; recording with classic WebDriver (no console or network data)");
                false
            }
        };
        if binding_wants_bidi && connected {
            let session_id = session_id.unwrap_or_default();
            capabilities["webSocketUrl"] = json!(format!(
                "ws://{}/session/{}/se/bidi",
                self.proxy_addr, session_id
            ));
        } else if !binding_wants_bidi && let Some(caps) = capabilities.as_object_mut() {
            caps.remove("webSocketUrl");
        }
        serde_json::to_vec(&response).unwrap_or(response_body)
    }

    async fn connect_bidi(&self, url: &str, headers: &[(String, String)]) -> bool {
        let Some(rec) = self.recording.clone() else {
            return false;
        };
        let handler_rec = rec.clone();
        let handler: EventHandler = Arc::new(move |method, params| {
            handler_rec.lock().unwrap().add_bidi_event(method, params);
        });
        let connected = async {
            let client = BiDiClient::connect(url, headers, handler).await?;
            client.subscribe(BIDI_EVENTS).await?;
            Ok::<BiDiClient, Error>(client)
        }
        .await;
        match connected {
            Ok(client) => {
                *self.bidi.lock().unwrap() = Some(Arc::new(client));
                rec.lock().unwrap().bidi = true;
                self.diagnostic(format!("Recording through WebDriver BiDi at {}", url));
                true
            }
            Err(err) => {
                self.warning(format!(
                    "BiDi connection failed ({}); recording with classic WebDriver (no console or network data)",
                    err
                ));
                false
            }
        }
    }

    /// Serves the binding's BiDi connection for the session, multiplexed over the proxy's own.
    async fn serve_bidi<S>(
        &self,
        stream: &mut S,
        request: &HttpRequest,
        session_id: &str,
    ) -> Result<(), Error>
    where
        S: AsyncRead + AsyncWrite + Unpin,
    {
        let current = self.session_id.lock().unwrap().clone();
        let bidi = self.bidi.lock().unwrap().clone();
        let key = request
            .headers
            .iter()
            .find(|(name, _)| name.eq_ignore_ascii_case("sec-websocket-key"))
            .map(|(_, value)| value.clone());
        let (Some(bidi), Some(key), true) = (bidi, key, current.as_deref() == Some(session_id))
        else {
            let error = json!({"value": {"error": "unknown command",
                "message": "No BiDi connection for this session"}});
            write_response(
                stream,
                404,
                "application/json",
                error.to_string().as_bytes(),
            )
            .await?;
            return Ok(stream.flush().await?);
        };
        let handshake = format!(
            "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: {}\r\n\r\n",
            derive_accept_key(key.as_bytes())
        );
        stream.write_all(handshake.as_bytes()).await?;
        stream.flush().await?;

        let socket = WebSocketStream::from_raw_socket(stream, Role::Server, None).await;
        let (mut sink, mut source) = socket.split();
        let (out, mut queue) = mpsc::unbounded_channel();
        let conn = bidi.attach(out.clone());

        let writer = async {
            while let Some(slot) = queue.recv().await {
                if let Ok(Some(text)) = slot.await
                    && sink.send(Message::text(text)).await.is_err()
                {
                    break;
                }
            }
            let _ = sink.close().await;
        };
        let reader = async {
            let mut in_flight: FuturesUnordered<Pin<Box<dyn Future<Output = ()> + Send + '_>>> =
                FuturesUnordered::new();
            loop {
                tokio::select! {
                    incoming = source.next() => match incoming {
                        Some(Ok(Message::Text(text))) => {
                            if let Some(pending) = self.downstream_command(&bidi, conn, &out, text.as_str()).await {
                                in_flight.push(pending);
                            }
                        }
                        Some(Ok(_)) => {}
                        _ => break,
                    },
                    Some(()) = in_flight.next(), if !in_flight.is_empty() => {}
                }
            }
            // Responses still in flight are not written; closing the queue ends the writer.
            bidi.detach(conn);
            drop(out);
        };
        tokio::join!(writer, reader);
        Ok(())
    }

    /// Records a BiDi command of the binding and forwards it. The returned future completes the
    /// recorded action (and its screenshot) before the response is written to the binding.
    async fn downstream_command<'a>(
        &'a self,
        bidi: &Arc<BiDiClient>,
        conn: u64,
        out: &Outgoing,
        text: &str,
    ) -> Option<Pin<Box<dyn Future<Output = ()> + Send + 'a>>> {
        let message = serde_json::from_str::<Value>(text).unwrap_or(Value::Null);
        let method = message["method"].as_str().unwrap_or_default().to_string();
        let params = message["params"].clone();
        let action = self
            .recording
            .as_ref()
            .and_then(|rec| rec.lock().unwrap().start_bidi_action(&method, &params));
        if let (Some(index), Some(rec)) = (action, &self.recording)
            && method == "input.performActions"
            && self.password_field_focused().await
        {
            let mut rec = rec.lock().unwrap();
            if let Some(recorded) = rec.actions[index].request_body.as_mut() {
                redact_key_actions(recorded);
            }
        }

        let response = match bidi.forward(conn, message.clone()) {
            Ok(response) => response,
            Err(err) => {
                let error = json!({"type": "error", "id": message.get("id"),
                    "error": "invalid argument", "message": err.to_string()});
                let (slot, filled) = oneshot::channel();
                let _ = slot.send(Some(error.to_string()));
                let _ = out.send(filled);
                return None;
            }
        };
        let bidi = bidi.clone();
        Some(Box::pin(async move {
            let Ok(response) = response.await else {
                return;
            };
            let mut visual = false;
            if let (Some(index), Some(rec)) = (action, &self.recording) {
                let mut rec = rec.lock().unwrap();
                rec.end_bidi_action(index, &response.message);
                visual = rec.actions[index].info.visual && response.message["type"] == "success";
            }
            if visual && let Some(index) = action {
                self.capture_screenshot(index).await;
            }
            if bidi.take_legacy_unsubscribe() {
                match bidi.subscribe(BIDI_EVENTS).await {
                    Ok(_) => self.diagnostic("Subscribed again after the binding unsubscribed"),
                    Err(err) => self.diagnostic(format!("Unable to subscribe again: {}", err)),
                }
            }
            response.deliver();
        }))
    }

    /// Whether the focused element is a password field, so typed keys must not be recorded.
    async fn password_field_focused(&self) -> bool {
        let Some(session_id) = self.session_id.lock().unwrap().clone() else {
            return false;
        };
        let url = format!("{}/session/{}/execute/sync", self.webdriver_url, session_id);
        let body = json!({"script": PASSWORD_FOCUSED_SCRIPT, "args": []});
        let response = self
            .client
            .post(&url)
            .header(reqwest::header::CONTENT_TYPE, "application/json")
            .body(body.to_string())
            .send()
            .await;
        let Ok(response) = response else {
            return false;
        };
        let value = response
            .bytes()
            .await
            .ok()
            .and_then(|b| serde_json::from_slice::<Value>(&b).ok());
        value.is_some_and(|v| v["value"] == true)
    }

    async fn is_password_field(&self, element_id: &str) -> bool {
        let Some(session_id) = self.session_id.lock().unwrap().clone() else {
            return false;
        };
        let url = format!(
            "{}/session/{}/element/{}/property/type",
            self.webdriver_url, session_id, element_id
        );
        self.get_value(&url).await.is_some_and(|v| {
            v.as_str()
                .is_some_and(|t| t.eq_ignore_ascii_case("password"))
        })
    }

    fn has_bidi(&self) -> bool {
        self.bidi.lock().unwrap().is_some()
    }

    async fn capture_screenshot(&self, index: usize) {
        let Some(session_id) = self.session_id.lock().unwrap().clone() else {
            return;
        };
        let bidi = self.bidi.lock().unwrap().clone();
        let mut encoded = None;
        if let Some(bidi) = bidi {
            match self.bidi_screenshot(&bidi, &session_id).await {
                Ok(data) => encoded = Some(data),
                Err(err) => self.diagnostic(format!("BiDi screenshot failed: {}", err)),
            }
        }
        if encoded.is_none() {
            let url = format!("{}/session/{}/screenshot", self.webdriver_url, session_id);
            encoded = self
                .get_value(&url)
                .await
                .and_then(|v| v.as_str().map(str::to_string));
        }
        let decoded = encoded.and_then(|data| BASE64.decode(data).ok());
        if let (Some(png), Some(rec)) = (decoded, &self.recording) {
            rec.lock().unwrap().set_screenshot(index, png);
        }
    }

    async fn bidi_screenshot(&self, bidi: &BiDiClient, session_id: &str) -> Result<String, Error> {
        // Classic window handles are the BiDi ids of top-level browsing contexts.
        let url = format!("{}/session/{}/window", self.webdriver_url, session_id);
        let context = self
            .get_value(&url)
            .await
            .and_then(|v| v.as_str().map(str::to_string))
            .ok_or_else(|| anyhow!("unable to read current window handle"))?;
        bidi.capture_screenshot(&context).await
    }

    /// Chromium-only legacy endpoint, used when BiDi console events are unavailable.
    async fn collect_classic_logs(&self) {
        if self.has_bidi() || self.recording.is_none() {
            return;
        }
        let Some(session_id) = self.session_id.lock().unwrap().clone() else {
            return;
        };
        let url = format!("{}/session/{}/se/log", self.webdriver_url, session_id);
        let response = self
            .client
            .post(&url)
            .header(reqwest::header::CONTENT_TYPE, "application/json")
            .body(json!({"type": "browser"}).to_string())
            .send()
            .await;
        let Ok(response) = response else {
            return;
        };
        if !response.status().is_success() {
            return;
        }
        let value = response
            .bytes()
            .await
            .ok()
            .and_then(|b| serde_json::from_slice::<Value>(&b).ok());
        if let (Some(value), Some(rec)) = (value, &self.recording)
            && let Some(entries) = value["value"].as_array()
        {
            let mut rec = rec.lock().unwrap();
            entries
                .iter()
                .for_each(|entry| rec.add_classic_log_entry(entry));
        }
    }

    async fn get_value(&self, url: &str) -> Option<Value> {
        let response = self.client.get(url).send().await.ok()?;
        if !response.status().is_success() {
            return None;
        }
        let body: Value = serde_json::from_slice(&response.bytes().await.ok()?).ok()?;
        Some(body["value"].clone())
    }

    fn finish_recording(&self) {
        if let Some(bidi) = self.bidi.lock().unwrap().take() {
            bidi.close();
        }
        let Some(rec) = &self.recording else {
            return;
        };
        let mut result = self.trace_result.lock().unwrap();
        if result.is_none() {
            let rec = rec.lock().unwrap();
            *result = Some(
                archiver::package(&rec)
                    .map(|_| rec.path.clone())
                    .map_err(|e| e.to_string()),
            );
        }
    }

    /// Called on SIGINT/SIGTERM: closes the browser session and saves what was recorded.
    async fn abandon_session(&self) {
        let _guard = self.command_lock.lock().await;
        self.collect_classic_logs().await;
        self.finish_recording();
        let session_id = self.session_id.lock().unwrap().take();
        if let Some(session_id) = session_id {
            let url = format!("{}/session/{}", self.webdriver_url, session_id);
            let _ =
                tokio::time::timeout(Duration::from_secs(10), self.client.delete(url).send()).await;
        }
    }

    fn saved_trace(&self) -> Option<Result<PathBuf, String>> {
        self.trace_result.lock().unwrap().clone()
    }

    fn diagnostic<T: Into<String>>(&self, message: T) {
        self.diagnostics
            .lock()
            .unwrap()
            .push((false, message.into()));
    }

    /// Something users should know about, e.g. the trace will be missing console and network.
    fn warning<T: Into<String>>(&self, message: T) {
        self.diagnostics
            .lock()
            .unwrap()
            .push((true, message.into()));
    }

    fn drain_diagnostics(&self, log: &Logger) {
        let messages: Vec<(bool, String)> = self.diagnostics.lock().unwrap().drain(..).collect();
        for (warning, message) in messages {
            if warning {
                log.warn(message);
            } else {
                log.debug(message);
            }
        }
    }
}

/// Where a request is going, relative to the WebDriver session.
struct Route {
    method: String,
    is_session_endpoint: bool,
    /// Path after `/session/{id}`; empty for the session itself.
    command_path: String,
    session_id: Option<String>,
}

impl Route {
    fn parse(method: &str, path: &str) -> Self {
        let path = path.split('?').next().unwrap_or_default();
        let mut command_path = String::new();
        let mut session_id = None;
        let mut is_session_endpoint = false;
        if let Some(rest) = path.strip_prefix("/session") {
            if rest.is_empty() || rest == "/" {
                is_session_endpoint = true;
            } else if let Some(after_slash) = rest.strip_prefix('/') {
                is_session_endpoint = true;
                session_id = after_slash.split('/').next().map(str::to_string);
                command_path = after_slash
                    .find('/')
                    .map(|i| after_slash[i..].trim_end_matches('/').to_string())
                    .unwrap_or_default();
                if !after_slash.contains('/') && method == "POST" {
                    // POST /session/{id} is not a WebDriver command.
                    is_session_endpoint = false;
                }
            }
        }
        Route {
            method: method.to_string(),
            is_session_endpoint,
            command_path,
            session_id,
        }
    }

    /// Session whose BiDi connection is requested (WebSocket upgrade of `/session/{id}/se/bidi`).
    fn bidi_session(&self) -> Option<&str> {
        (self.method == "GET" && self.command_path == "/se/bidi")
            .then_some(self.session_id.as_deref())
            .flatten()
    }

    fn is_actions(&self) -> bool {
        self.is_session_endpoint && self.method == "POST" && self.command_path == "/actions"
    }

    fn is_new_session(&self) -> bool {
        self.is_session_endpoint && self.method == "POST" && self.command_path.is_empty()
    }

    fn is_delete_session(&self) -> bool {
        self.is_session_endpoint && self.method == "DELETE" && self.command_path.is_empty()
    }

    /// Element receiving text in an "Element Send Keys" command, if this is one.
    fn typed_element(&self) -> Option<&str> {
        let segments: Vec<&str> = self.command_path.trim_matches('/').split('/').collect();
        match (self.method.as_str(), segments.as_slice()) {
            ("POST", ["element", id, "value"]) => Some(id),
            _ => None,
        }
    }

    /// Queries (GET) are left out of the trace to keep it focused on what the test did.
    fn recordable(&self) -> bool {
        self.is_session_endpoint && self.method != "GET"
    }
}

/// Adds `webSocketUrl: true` to a new session request, so the proxy always gets BiDi.
/// Returns the patched body and whether the binding asked for BiDi itself.
fn request_bidi(body: &[u8]) -> (Vec<u8>, bool) {
    let Ok(mut payload) = serde_json::from_slice::<Value>(body) else {
        return (body.to_vec(), false);
    };
    if !payload.is_object() {
        return (body.to_vec(), false);
    }
    if !payload["capabilities"].is_object() {
        payload["capabilities"] = json!({});
    }
    let capabilities = &mut payload["capabilities"];
    let mut wanted = capabilities["alwaysMatch"]["webSocketUrl"] == true;
    // A capability may not be in both alwaysMatch and firstMatch, so it moves to alwaysMatch.
    if let Some(all) = capabilities["firstMatch"].as_array_mut() {
        for first in all.iter_mut().filter_map(Value::as_object_mut) {
            wanted |= first.remove("webSocketUrl") == Some(json!(true));
        }
    }
    if !capabilities["alwaysMatch"].is_object() {
        capabilities["alwaysMatch"] = json!({});
    }
    capabilities["alwaysMatch"]["webSocketUrl"] = json!(true);
    match serde_json::to_vec(&payload) {
        Ok(patched) => (patched, wanted),
        Err(_) => (body.to_vec(), false),
    }
}

fn trace_error_line(message: &str) -> String {
    json!({ "trace_error": message }).to_string()
}

fn is_hop_by_hop(header: &str) -> bool {
    [
        "host",
        "connection",
        "content-length",
        "transfer-encoding",
        "keep-alive",
        "expect",
        "upgrade",
    ]
    .iter()
    .any(|h| header.eq_ignore_ascii_case(h))
}

struct HttpRequest {
    method: String,
    path: String,
    headers: Vec<(String, String)>,
    body: Vec<u8>,
}

async fn read_request<S: AsyncRead + Unpin>(stream: &mut S) -> Result<Option<HttpRequest>, Error> {
    let mut buffer = Vec::new();
    let header_end = loop {
        if let Some(position) = find(&buffer, b"\r\n\r\n") {
            break position;
        }
        if buffer.len() > MAX_HEADER_BYTES {
            return Err(anyhow!("HTTP request headers too large"));
        }
        if read_more(stream, &mut buffer).await? == 0 {
            if buffer.is_empty() {
                return Ok(None);
            }
            return Err(anyhow!("connection closed while reading HTTP headers"));
        }
    };

    let head = String::from_utf8_lossy(&buffer[..header_end]).to_string();
    let mut lines = head.split("\r\n");
    let mut request_line = lines.next().unwrap_or_default().split_whitespace();
    let method = request_line.next().unwrap_or_default().to_string();
    let path = request_line.next().unwrap_or_default().to_string();
    if method.is_empty() || path.is_empty() {
        return Err(anyhow!("malformed HTTP request line"));
    }
    let headers: Vec<(String, String)> = lines
        .filter_map(|line| line.split_once(':'))
        .map(|(name, value)| (name.trim().to_string(), value.trim().to_string()))
        .collect();
    let header = |name: &str| {
        headers
            .iter()
            .find(|(n, _)| n.eq_ignore_ascii_case(name))
            .map(|(_, v)| v.as_str())
    };

    let mut rest = buffer[header_end + 4..].to_vec();
    let body = if header("transfer-encoding")
        .is_some_and(|v| v.to_ascii_lowercase().contains("chunked"))
    {
        read_chunked_body(stream, rest).await?
    } else {
        let length: usize = header("content-length")
            .and_then(|v| v.parse().ok())
            .unwrap_or(0);
        while rest.len() < length {
            if read_more(stream, &mut rest).await? == 0 {
                return Err(anyhow!("connection closed while reading HTTP body"));
            }
        }
        rest.truncate(length);
        rest
    };
    Ok(Some(HttpRequest {
        method,
        path,
        headers,
        body,
    }))
}

async fn read_chunked_body<S: AsyncRead + Unpin>(
    stream: &mut S,
    mut pending: Vec<u8>,
) -> Result<Vec<u8>, Error> {
    let mut body = Vec::new();
    loop {
        let line_end = loop {
            if let Some(position) = find(&pending, b"\r\n") {
                break position;
            }
            if read_more(stream, &mut pending).await? == 0 {
                return Err(anyhow!("connection closed while reading chunk size"));
            }
        };
        let size_text = String::from_utf8_lossy(&pending[..line_end]).to_string();
        let size_hex = size_text.split(';').next().unwrap_or_default().trim();
        let size = usize::from_str_radix(size_hex, 16)?;
        pending.drain(..line_end + 2);
        if size == 0 {
            return Ok(body);
        }
        while pending.len() < size + 2 {
            if read_more(stream, &mut pending).await? == 0 {
                return Err(anyhow!("connection closed while reading chunk"));
            }
        }
        body.extend_from_slice(&pending[..size]);
        pending.drain(..size + 2);
    }
}

async fn read_more<S: AsyncRead + Unpin>(
    stream: &mut S,
    buffer: &mut Vec<u8>,
) -> Result<usize, Error> {
    let mut chunk = [0u8; 8192];
    let read = stream.read(&mut chunk).await?;
    buffer.extend_from_slice(&chunk[..read]);
    Ok(read)
}

fn find(haystack: &[u8], needle: &[u8]) -> Option<usize> {
    haystack.windows(needle.len()).position(|w| w == needle)
}

async fn write_response<S: AsyncWrite + Unpin>(
    stream: &mut S,
    status: u16,
    content_type: &str,
    body: &[u8],
) -> Result<(), Error> {
    let reason = reqwest::StatusCode::from_u16(status)
        .ok()
        .and_then(|s| s.canonical_reason())
        .unwrap_or("Unknown");
    let head = format!(
        "HTTP/1.1 {} {}\r\nContent-Type: {}\r\nContent-Length: {}\r\nCache-Control: no-cache\r\nConnection: close\r\n\r\n",
        status,
        reason,
        content_type,
        body.len()
    );
    stream.write_all(head.as_bytes()).await?;
    stream.write_all(body).await?;
    Ok(())
}

/// Client for the driver on localhost: never routed through the user's HTTP proxy settings.
fn local_http_client() -> Client {
    let _ = rustls::crypto::ring::default_provider().install_default();
    Client::builder()
        .no_proxy()
        .build()
        .expect("HTTP client for the local driver")
}

/// The driver process (chromedriver, geckodriver, msedgedriver) started by pipe mode.
struct DriverProcess {
    child: Child,
    base_url: String,
}

impl DriverProcess {
    async fn start(driver_path: &Path) -> Result<Self, Error> {
        let port = std::net::TcpListener::bind("127.0.0.1:0")?
            .local_addr()?
            .port();
        let mut command = Command::new(driver_path);
        command.arg(format!("--port={}", port));
        let is_geckodriver = driver_path
            .file_name()
            .is_some_and(|n| n.to_string_lossy().contains("geckodriver"));
        if is_geckodriver {
            // Let geckodriver pick a free BiDi port so concurrent sessions do not collide.
            command.args(["--websocket-port", "0"]);
        }
        let mut child = command
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()?;
        let base_url = format!("http://127.0.0.1:{}", port);

        let client = local_http_client();
        let deadline = Instant::now() + DRIVER_STARTUP_TIMEOUT;
        while Instant::now() < deadline {
            if let Some(status) = child.try_wait()? {
                return Err(anyhow!("Driver exited during startup with {}", status));
            }
            let ready = client.get(format!("{}/status", base_url)).send().await;
            if ready.is_ok_and(|r| r.status().is_success()) {
                return Ok(DriverProcess { child, base_url });
            }
            tokio::time::sleep(POLL_INTERVAL).await;
        }
        let _ = child.kill();
        Err(anyhow!(
            "Driver did not become ready within {} seconds",
            DRIVER_STARTUP_TIMEOUT.as_secs()
        ))
    }

    fn stop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

extern "C" fn on_shutdown_signal(_signal: libc::c_int) {
    SHUTDOWN_REQUESTED.store(true, Ordering::SeqCst);
}

fn install_signal_handlers() {
    let handler = on_shutdown_signal as extern "C" fn(libc::c_int) as libc::sighandler_t;
    // SAFETY: the handler only stores into an atomic, which is async-signal-safe.
    unsafe {
        libc::signal(libc::SIGINT, handler);
        libc::signal(libc::SIGTERM, handler);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use futures_util::{SinkExt, StreamExt};
    use tokio::io::duplex;
    use tokio_tungstenite::tungstenite::Message;

    async fn parse(raw: &[u8]) -> HttpRequest {
        let (mut client, mut server) = duplex(64 * 1024);
        client.write_all(raw).await.unwrap();
        drop(client);
        read_request(&mut server).await.unwrap().unwrap()
    }

    #[tokio::test]
    async fn reads_content_length_bodies() {
        let body = vec![b'x'; 20_000];
        let mut raw = format!(
            "POST /session HTTP/1.1\r\nHost: localhost\r\nContent-Length: {}\r\n\r\n",
            body.len()
        )
        .into_bytes();
        raw.extend(&body);
        let request = parse(&raw).await;
        assert_eq!(request.method, "POST");
        assert_eq!(request.path, "/session");
        assert_eq!(request.body.len(), 20_000);
    }

    #[tokio::test]
    async fn reads_chunked_bodies_and_headers_without_spaces() {
        let raw = b"POST /x HTTP/1.1\r\nTransfer-Encoding:chunked\r\n\r\n5\r\nhello\r\n6\r\n world\r\n0\r\n\r\n";
        let request = parse(raw).await;
        assert_eq!(request.body, b"hello world");
        assert_eq!(
            request.headers[0],
            ("Transfer-Encoding".into(), "chunked".into())
        );
    }

    #[tokio::test]
    async fn empty_connection_is_not_a_request() {
        let (client, mut server) = duplex(1024);
        drop(client);
        assert!(read_request(&mut server).await.unwrap().is_none());
    }

    #[test]
    fn routes_session_commands() {
        assert!(Route::parse("POST", "/session").is_new_session());
        let delete = Route::parse("DELETE", "/session/abc");
        assert!(delete.is_delete_session());
        assert!(delete.recordable());
        let click = Route::parse("POST", "/session/abc/element/e1/click");
        assert_eq!(click.command_path, "/element/e1/click");
        assert!(!click.is_delete_session());
        assert!(!Route::parse("GET", "/session/abc/title").recordable());
        assert!(!Route::parse("GET", "/status").recordable());
        assert!(!Route::parse("DELETE", "/session/abc/window").is_delete_session());
    }

    #[test]
    fn requests_bidi_and_reports_whether_the_binding_did() {
        let parse = |body: &[u8]| -> (Value, bool) {
            let (patched, wanted) = request_bidi(body);
            (serde_json::from_slice(&patched).unwrap(), wanted)
        };
        let (payload, wanted) =
            parse(br#"{"capabilities":{"firstMatch":[{"browserName":"chrome"}]}}"#);
        assert!(!wanted);
        assert_eq!(payload["capabilities"]["alwaysMatch"]["webSocketUrl"], true);
        assert_eq!(
            payload["capabilities"]["firstMatch"][0]["browserName"],
            "chrome"
        );

        let (payload, wanted) = parse(br#"{"capabilities":{"alwaysMatch":{"webSocketUrl":true}}}"#);
        assert!(wanted);
        assert_eq!(payload["capabilities"]["alwaysMatch"]["webSocketUrl"], true);

        // A capability may not be in both alwaysMatch and firstMatch.
        let (payload, wanted) =
            parse(br#"{"capabilities":{"firstMatch":[{"webSocketUrl":true}]}}"#);
        assert!(wanted);
        assert_eq!(payload["capabilities"]["alwaysMatch"]["webSocketUrl"], true);
        assert!(
            payload["capabilities"]["firstMatch"][0]
                .get("webSocketUrl")
                .is_none()
        );

        let (_, wanted) = parse(br#"{"capabilities":{"alwaysMatch":{"webSocketUrl":false}}}"#);
        assert!(!wanted);
        assert_eq!(request_bidi(b"not json"), (b"not json".to_vec(), false));
    }

    /// Fake classic WebDriver endpoint (no BiDi) for end-to-end proxy tests.
    async fn fake_driver() -> String {
        const PNG_BASE64: &str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        tokio::spawn(async move {
            loop {
                let (mut stream, _) = listener.accept().await.unwrap();
                tokio::spawn(async move {
                    let request = read_request(&mut stream).await.unwrap().unwrap();
                    let value = match (request.method.as_str(), request.path.as_str()) {
                        ("POST", "/session") => {
                            json!({"sessionId": "s1", "capabilities": {"browserName": "chrome"}})
                        }
                        ("GET", "/session/s1/screenshot") => json!(PNG_BASE64),
                        ("GET", "/session/s1/element/pwd/property/type") => json!("password"),
                        ("GET", "/session/s1/element/txt/property/type") => json!("text"),
                        _ => Value::Null,
                    };
                    let body = json!({"value": value}).to_string();
                    write_response(&mut stream, 200, "application/json", body.as_bytes())
                        .await
                        .unwrap();
                });
            }
        });
        url
    }

    async fn send(state: &ProxyState, method: &str, path: &str, body: &str) -> Value {
        let (mut client, mut server) = duplex(1024 * 1024);
        let raw = format!(
            "{} {} HTTP/1.1\r\nContent-Type: application/json\r\nContent-Length: {}\r\n\r\n{}",
            method,
            path,
            body.len(),
            body
        );
        client.write_all(raw.as_bytes()).await.unwrap();
        state.handle_connection(&mut server).await.unwrap();
        drop(server);
        let mut response = Vec::new();
        client.read_to_end(&mut response).await.unwrap();
        let text = String::from_utf8(response).unwrap();
        let (_, json_body) = text.split_once("\r\n\r\n").unwrap();
        serde_json::from_str(json_body).unwrap()
    }

    #[tokio::test]
    async fn records_a_classic_session_and_saves_trace_on_delete() {
        let dir = tempfile::tempdir().unwrap();
        let trace = dir.path().join("trace.zip");
        let recording = Recording::new(trace.clone(), "chrome", "java");
        let state = ProxyState::new(
            fake_driver().await,
            Some(recording),
            TEST_ADDR.parse().unwrap(),
        );

        let created = send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        assert_eq!(created["value"]["sessionId"], "s1");
        send(
            &state,
            "POST",
            "/session/s1/url",
            r#"{"url":"https://example.com"}"#,
        )
        .await;
        send(
            &state,
            "POST",
            "/session/s1/element/txt/value",
            r#"{"text":"user"}"#,
        )
        .await;
        send(
            &state,
            "POST",
            "/session/s1/element/pwd/value",
            r#"{"text":"hunter2"}"#,
        )
        .await;
        send(&state, "GET", "/session/s1/title", "").await;
        assert!(!trace.exists());
        send(&state, "DELETE", "/session/s1", "").await;

        assert!(state.session_ended.load(Ordering::SeqCst));
        assert_eq!(state.saved_trace(), Some(Ok(trace.clone())));
        let rec = state.recording.as_ref().unwrap().lock().unwrap();
        let titles: Vec<&str> = rec.actions.iter().map(|a| a.info.title.as_str()).collect();
        assert_eq!(
            titles,
            [
                "New session",
                "Navigate to \"https://example.com\"",
                "Type \"user\"",
                "Type \"********\"",
                "Quit"
            ]
        );
        let screenshot = rec.actions[1].screenshot.as_ref().unwrap();
        assert_eq!((screenshot.width, screenshot.height), (1, 1));
        assert!(!rec.bidi);
    }

    #[tokio::test]
    async fn plain_pipe_mode_forwards_without_recording() {
        let state = ProxyState::new(fake_driver().await, None, TEST_ADDR.parse().unwrap());
        let created = send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        assert_eq!(created["value"]["sessionId"], "s1");
        send(&state, "DELETE", "/session/s1", "").await;
        assert!(state.session_ended.load(Ordering::SeqCst));
        assert_eq!(state.saved_trace(), None);
    }

    const TEST_ADDR: &str = "127.0.0.1:4444";
    const PNG: &str = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    /// Fake BiDi endpoint with legacy subscription semantics: subscriptions are by event name
    /// for the whole session, and `session.unsubscribe` by names removes them for everyone.
    /// Each navigation emits a console event if `log.entryAdded` is subscribed.
    async fn fake_bidi_endpoint() -> String {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("ws://{}/session/s1", listener.local_addr().unwrap());
        tokio::spawn(async move {
            let (stream, _) = listener.accept().await.unwrap();
            let mut socket = tokio_tungstenite::accept_async(stream).await.unwrap();
            let mut subscribed: Vec<String> = Vec::new();
            let mut counter = 0;
            while let Some(Ok(Message::Text(text))) = socket.next().await {
                let command: Value = serde_json::from_str(text.as_str()).unwrap();
                let method = command["method"].as_str().unwrap_or_default().to_string();
                let names = |key: &str| -> Vec<String> {
                    command["params"][key]
                        .as_array()
                        .map(|a| {
                            a.iter()
                                .filter_map(|e| e.as_str().map(str::to_string))
                                .collect()
                        })
                        .unwrap_or_default()
                };
                let result = match method.as_str() {
                    "session.subscribe" => {
                        subscribed.extend(names("events"));
                        counter += 1;
                        json!({"subscription": format!("sub-{}", counter)})
                    }
                    "session.unsubscribe" => {
                        let removed = names("events");
                        subscribed.retain(|e| !removed.contains(e));
                        json!({})
                    }
                    "browsingContext.captureScreenshot" => json!({"data": PNG}),
                    _ => json!({}),
                };
                let reply = json!({"type": "success", "id": command["id"], "result": result});
                socket.send(Message::text(reply.to_string())).await.unwrap();
                let console = subscribed
                    .iter()
                    .any(|e| e == "log" || e == "log.entryAdded");
                if method == "browsingContext.navigate" && console {
                    let event = json!({"type": "event", "method": "log.entryAdded", "params": {
                        "type": "console", "method": "log", "text": "hello",
                        "source": {"context": "top"}, "timestamp": 1}});
                    socket.send(Message::text(event.to_string())).await.unwrap();
                }
            }
        });
        url
    }

    /// Fake driver offering BiDi; its active element is a password field.
    async fn fake_bidi_driver() -> String {
        let ws_url = fake_bidi_endpoint().await;
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let url = format!("http://{}", listener.local_addr().unwrap());
        tokio::spawn(async move {
            loop {
                let (mut stream, _) = listener.accept().await.unwrap();
                let ws_url = ws_url.clone();
                tokio::spawn(async move {
                    let request = read_request(&mut stream).await.unwrap().unwrap();
                    let value = match (request.method.as_str(), request.path.as_str()) {
                        ("POST", "/session") => json!({"sessionId": "s1", "capabilities": {
                            "browserName": "chrome", "webSocketUrl": ws_url}}),
                        ("GET", "/session/s1/window") => json!("top"),
                        ("GET", "/session/s1/screenshot") => json!(PNG),
                        ("POST", "/session/s1/execute/sync") => json!(true),
                        _ => Value::Null,
                    };
                    let body = json!({"value": value}).to_string();
                    write_response(&mut stream, 200, "application/json", body.as_bytes())
                        .await
                        .unwrap();
                });
            }
        });
        url
    }

    /// A recording proxy listening for real, so bindings can open WebSocket connections to it.
    async fn listening_proxy(trace: PathBuf) -> Arc<ProxyState> {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let addr = listener.local_addr().unwrap();
        let recording = Recording::new(trace, "chrome", "java");
        let state = Arc::new(ProxyState::new(
            fake_bidi_driver().await,
            Some(recording),
            addr,
        ));
        tokio::spawn(accept_loop(listener, state.clone()));
        state
    }

    type Binding = tokio_tungstenite::WebSocketStream<
        tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>,
    >;

    async fn binding_bidi(created: &Value) -> Binding {
        let url = created["value"]["capabilities"]["webSocketUrl"]
            .as_str()
            .unwrap();
        tokio_tungstenite::connect_async(url).await.unwrap().0
    }

    async fn call(binding: &mut Binding, command: Value) -> Value {
        binding
            .send(Message::text(command.to_string()))
            .await
            .unwrap();
        next_message(binding, Duration::from_secs(5)).await.unwrap()
    }

    async fn next_message(binding: &mut Binding, wait: Duration) -> Option<Value> {
        match tokio::time::timeout(wait, binding.next()).await {
            Ok(Some(Ok(Message::Text(text)))) => serde_json::from_str(text.as_str()).ok(),
            _ => None,
        }
    }

    const ASK_BIDI: &str = r#"{"capabilities":{"alwaysMatch":{"webSocketUrl":true}}}"#;

    #[tokio::test]
    async fn rewrites_web_socket_url_when_the_binding_asked_for_bidi() {
        let dir = tempfile::tempdir().unwrap();
        let recording = Recording::new(dir.path().join("t.zip"), "chrome", "java");
        let addr = "127.0.0.1:4444".parse().unwrap();
        let state = ProxyState::new(fake_bidi_driver().await, Some(recording), addr);
        let created = send(&state, "POST", "/session", ASK_BIDI).await;
        assert_eq!(
            created["value"]["capabilities"]["webSocketUrl"],
            "ws://127.0.0.1:4444/session/s1/se/bidi"
        );
    }

    #[tokio::test]
    async fn removes_web_socket_url_when_the_binding_did_not_ask() {
        let dir = tempfile::tempdir().unwrap();
        let recording = Recording::new(dir.path().join("t.zip"), "chrome", "java");
        let addr = "127.0.0.1:4444".parse().unwrap();
        let state = ProxyState::new(fake_bidi_driver().await, Some(recording), addr);
        let created = send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        assert!(
            created["value"]["capabilities"]
                .get("webSocketUrl")
                .is_none()
        );
        assert!(state.has_bidi());
    }

    #[tokio::test]
    async fn upstream_is_ready_before_new_session_reply() {
        let dir = tempfile::tempdir().unwrap();
        let state = listening_proxy(dir.path().join("t.zip")).await;
        let created = send(&state, "POST", "/session", ASK_BIDI).await;
        let mut binding = binding_bidi(&created).await;
        let reply = call(
            &mut binding,
            json!({"id": 5, "method": "session.status", "params": {}}),
        )
        .await;
        assert_eq!(reply["id"], 5);
        assert_eq!(reply["type"], "success");
    }

    #[tokio::test]
    async fn upgrade_to_unknown_session_is_404() {
        let dir = tempfile::tempdir().unwrap();
        let state = listening_proxy(dir.path().join("t.zip")).await;
        let created = send(&state, "POST", "/session", ASK_BIDI).await;
        let url = created["value"]["capabilities"]["webSocketUrl"]
            .as_str()
            .unwrap()
            .replace("/s1/", "/other/");
        match tokio_tungstenite::connect_async(url).await {
            Err(tokio_tungstenite::tungstenite::Error::Http(response)) => {
                assert_eq!(response.status(), 404)
            }
            other => panic!("unexpected handshake result: {:?}", other.map(|_| ())),
        }
    }

    #[tokio::test]
    async fn records_binding_bidi_commands_with_screenshot() {
        let dir = tempfile::tempdir().unwrap();
        let state = listening_proxy(dir.path().join("t.zip")).await;
        let created = send(&state, "POST", "/session", ASK_BIDI).await;
        let mut binding = binding_bidi(&created).await;
        let navigate = json!({"id": 1, "method": "browsingContext.navigate",
            "params": {"context": "top", "url": "https://example.com"}});
        assert_eq!(call(&mut binding, navigate).await["id"], 1);
        send(&state, "DELETE", "/session/s1", "").await;

        let rec = state.recording.as_ref().unwrap().lock().unwrap();
        let navigation = rec
            .actions
            .iter()
            .find(|a| a.info.title == "Navigate to \"https://example.com\"")
            .unwrap();
        assert!(navigation.screenshot.is_some());
        assert_eq!(rec.console[0].text, "hello");
    }

    #[tokio::test]
    async fn keeps_recording_after_legacy_unsubscribe() {
        let dir = tempfile::tempdir().unwrap();
        let state = listening_proxy(dir.path().join("t.zip")).await;
        let created = send(&state, "POST", "/session", ASK_BIDI).await;
        let mut binding = binding_bidi(&created).await;
        let subscribe = json!({"id": 1, "method": "session.subscribe",
            "params": {"events": ["log.entryAdded"]}});
        call(&mut binding, subscribe).await;
        let unsubscribe = json!({"id": 2, "method": "session.unsubscribe",
            "params": {"events": ["log.entryAdded"]}});
        assert_eq!(call(&mut binding, unsubscribe).await["id"], 2);
        let navigate = json!({"id": 3, "method": "browsingContext.navigate",
            "params": {"context": "top", "url": "https://example.com"}});
        assert_eq!(call(&mut binding, navigate).await["id"], 3);
        assert!(
            next_message(&mut binding, Duration::from_millis(300))
                .await
                .is_none()
        );
        send(&state, "DELETE", "/session/s1", "").await;

        let rec = state.recording.as_ref().unwrap().lock().unwrap();
        assert_eq!(rec.console.len(), 1);
    }

    #[tokio::test]
    async fn redacts_actions_into_password_fields() {
        let dir = tempfile::tempdir().unwrap();
        let recording = Recording::new(dir.path().join("t.zip"), "chrome", "java");
        let addr = "127.0.0.1:4444".parse().unwrap();
        let state = ProxyState::new(fake_bidi_driver().await, Some(recording), addr);
        send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        let actions = r#"{"actions":[{"type":"key","id":"k","actions":[{"type":"keyDown","value":"hunter2"}]}]}"#;
        send(&state, "POST", "/session/s1/actions", actions).await;
        send(&state, "DELETE", "/session/s1", "").await;

        let rec = state.recording.as_ref().unwrap().lock().unwrap();
        let recorded: Vec<String> = rec
            .actions
            .iter()
            .filter_map(|a| a.request_body.as_ref().map(Value::to_string))
            .collect();
        assert!(recorded.iter().all(|body| !body.contains("hunter2")));
    }

    #[tokio::test]
    async fn bidi_loss_is_a_warning() {
        let dir = tempfile::tempdir().unwrap();
        let recording = Recording::new(dir.path().join("t.zip"), "chrome", "java");
        let state = ProxyState::new(
            fake_driver().await,
            Some(recording),
            TEST_ADDR.parse().unwrap(),
        );
        send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        let diagnostics = state.diagnostics.lock().unwrap();
        assert!(
            diagnostics
                .iter()
                .any(|(warning, message)| *warning && message.contains("classic WebDriver"))
        );
    }

    #[test]
    fn trace_error_line_is_json() {
        let line: Value = serde_json::from_str(&trace_error_line("disk full")).unwrap();
        assert_eq!(line["trace_error"], "disk full");
    }
}
