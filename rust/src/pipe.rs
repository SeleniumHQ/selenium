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
//! When recording, the proxy asks the driver for a WebDriver BiDi connection (`webSocketUrl`)
//! unless the binding already requested one itself. BiDi provides standard screenshots,
//! console messages and network events; without it the proxy falls back to classic WebDriver.

use crate::archiver;
use crate::bidi::{BiDiClient, EventHandler};
use crate::logger::Logger;
use crate::recorder::Recording;
use anyhow::{Error, anyhow};
use base64::Engine;
use base64::engine::general_purpose::STANDARD as BASE64;
use reqwest::Client;
use serde_json::{Value, json};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use tokio::io::{AsyncRead, AsyncReadExt, AsyncWrite, AsyncWriteExt};
use tokio::net::TcpListener;

const DRIVER_STARTUP_TIMEOUT: Duration = Duration::from_secs(30);
const POLL_INTERVAL: Duration = Duration::from_millis(100);
const MAX_HEADER_BYTES: usize = 64 * 1024;
const BIDI_EVENTS: &[&str] = &["log.entryAdded", "network.responseCompleted"];

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
    let state = Arc::new(ProxyState::new(driver.base_url.clone(), recording));
    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let proxy_url = format!("http://{}", listener.local_addr()?);
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
        Some(Err(err)) => log.warn(format!("Unable to save trace: {}", err)),
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
    client: Client,
    recording: Option<Arc<Mutex<Recording>>>,
    bidi: Mutex<Option<Arc<BiDiClient>>>,
    session_id: Mutex<Option<String>>,
    // Commands are handled one at a time so screenshots match the command that triggered them.
    command_lock: tokio::sync::Mutex<()>,
    session_ended: AtomicBool,
    trace_result: Mutex<Option<Result<PathBuf, String>>>,
    diagnostics: Mutex<Vec<String>>,
}

impl ProxyState {
    fn new(webdriver_url: String, recording: Option<Recording>) -> Self {
        ProxyState {
            webdriver_url,
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
        let _guard = self.command_lock.lock().await;
        let route = Route::parse(&request.method, &request.path);

        let mut body = request.body;
        let mut owns_bidi = false;
        if route.is_new_session() && self.recording.is_some() {
            let (patched, injected) = request_bidi(&body);
            body = patched;
            owns_bidi = injected;
            if !injected {
                self.diagnostic(
                    "The binding requested webSocketUrl itself; recording with classic WebDriver",
                );
            }
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
            response_body = self.on_session_created(response_body, owns_bidi).await;
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

    async fn on_session_created(&self, response_body: Vec<u8>, owns_bidi: bool) -> Vec<u8> {
        let Ok(mut response) = serde_json::from_slice::<Value>(&response_body) else {
            return response_body;
        };
        let session_id = response["value"]["sessionId"].as_str().map(str::to_string);
        *self.session_id.lock().unwrap() = session_id.clone();
        if let Some(rec) = &self.recording {
            rec.lock().unwrap().session_id = session_id;
        }
        if !owns_bidi {
            return response_body;
        }

        // The BiDi connection belongs to the proxy, so the binding must not see it.
        let capabilities = &mut response["value"]["capabilities"];
        let ws_url = capabilities["webSocketUrl"].as_str().map(str::to_string);
        if let Some(caps) = capabilities.as_object_mut() {
            caps.remove("webSocketUrl");
        }
        match ws_url {
            Some(url) => self.connect_bidi(&url).await,
            None => self.diagnostic("Driver did not return webSocketUrl; using classic WebDriver"),
        }
        serde_json::to_vec(&response).unwrap_or(response_body)
    }

    async fn connect_bidi(&self, url: &str) {
        let Some(rec) = self.recording.clone() else {
            return;
        };
        let handler_rec = rec.clone();
        let handler: EventHandler = Arc::new(move |method, params| {
            handler_rec.lock().unwrap().add_bidi_event(method, params);
        });
        let connected = async {
            let client = BiDiClient::connect(url, handler).await?;
            client.subscribe(BIDI_EVENTS).await?;
            Ok::<BiDiClient, Error>(client)
        }
        .await;
        match connected {
            Ok(client) => {
                *self.bidi.lock().unwrap() = Some(Arc::new(client));
                rec.lock().unwrap().bidi = true;
                self.diagnostic(format!("Recording through WebDriver BiDi at {}", url));
            }
            Err(err) => self.diagnostic(format!(
                "BiDi connection failed ({}); using classic WebDriver",
                err
            )),
        }
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
        self.diagnostics.lock().unwrap().push(message.into());
    }

    fn drain_diagnostics(&self, log: &Logger) {
        let messages: Vec<String> = self.diagnostics.lock().unwrap().drain(..).collect();
        messages.into_iter().for_each(|m| log.debug(m));
    }
}

/// Where a request is going, relative to the WebDriver session.
struct Route {
    method: String,
    is_session_endpoint: bool,
    /// Path after `/session/{id}`; empty for the session itself.
    command_path: String,
}

impl Route {
    fn parse(method: &str, path: &str) -> Self {
        let path = path.split('?').next().unwrap_or_default();
        let mut command_path = String::new();
        let mut is_session_endpoint = false;
        if let Some(rest) = path.strip_prefix("/session") {
            if rest.is_empty() || rest == "/" {
                is_session_endpoint = true;
            } else if let Some(after_slash) = rest.strip_prefix('/') {
                is_session_endpoint = true;
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
        }
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

/// Adds `webSocketUrl: true` to a new session request unless the binding asked for it.
/// Returns the (possibly) patched body and whether the proxy now owns the BiDi connection.
fn request_bidi(body: &[u8]) -> (Vec<u8>, bool) {
    let Ok(mut payload) = serde_json::from_slice::<Value>(body) else {
        return (body.to_vec(), false);
    };
    let capabilities = &payload["capabilities"];
    let requested_by_client = capabilities["alwaysMatch"].get("webSocketUrl").is_some()
        || capabilities["firstMatch"]
            .as_array()
            .is_some_and(|all| all.iter().any(|c| c.get("webSocketUrl").is_some()));
    if requested_by_client || !payload.is_object() {
        return (body.to_vec(), false);
    }
    if !payload["capabilities"].is_object() {
        payload["capabilities"] = json!({});
    }
    if !payload["capabilities"]["alwaysMatch"].is_object() {
        payload["capabilities"]["alwaysMatch"] = json!({});
    }
    payload["capabilities"]["alwaysMatch"]["webSocketUrl"] = json!(true);
    match serde_json::to_vec(&payload) {
        Ok(patched) => (patched, true),
        Err(_) => (body.to_vec(), false),
    }
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
    use tokio::io::duplex;

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
    fn requests_bidi_unless_binding_did() {
        let (patched, injected) =
            request_bidi(br#"{"capabilities":{"firstMatch":[{"browserName":"chrome"}]}}"#);
        assert!(injected);
        let payload: Value = serde_json::from_slice(&patched).unwrap();
        assert_eq!(payload["capabilities"]["alwaysMatch"]["webSocketUrl"], true);
        assert_eq!(
            payload["capabilities"]["firstMatch"][0]["browserName"],
            "chrome"
        );

        let own = br#"{"capabilities":{"alwaysMatch":{"webSocketUrl":true}}}"#;
        assert_eq!(request_bidi(own), (own.to_vec(), false));
        let first = br#"{"capabilities":{"firstMatch":[{"webSocketUrl":true}]}}"#;
        assert!(!request_bidi(first).1);
        assert!(!request_bidi(b"not json").1);
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
        let state = ProxyState::new(fake_driver().await, Some(recording));

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
        let state = ProxyState::new(fake_driver().await, None);
        let created = send(&state, "POST", "/session", r#"{"capabilities":{}}"#).await;
        assert_eq!(created["value"]["sessionId"], "s1");
        send(&state, "DELETE", "/session/s1", "").await;
        assert!(state.session_ended.load(Ordering::SeqCst));
        assert_eq!(state.saved_trace(), None);
    }
}
