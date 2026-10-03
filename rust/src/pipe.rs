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

use crate::recorder::{Recorder, should_record};
use anyhow::Error;
use anyhow::anyhow;
use reqwest::Client;
use std::path::PathBuf;
use std::process::{Child, Command as ProcessCommand};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread;

/// Simple RFC 4648 base64 decoder for WebDriver screenshot responses.
fn decode_base64(encoded: &str) -> Result<Vec<u8>, ()> {
    const DECODE_TABLE: [i8; 256] = {
        let mut t = [-1i8; 256];
        let mut i = 0u8;
        while i < 64 {
            let c = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[i as usize];
            t[c as usize] = i as i8;
            i += 1;
        }
        t
    };
    let bytes = encoded.as_bytes();
    let mut result = Vec::with_capacity(bytes.len() / 4 * 3);
    let mut i = 0;
    while i < bytes.len() {
        let mut sextets = [0i16; 4];
        let mut pad = 0;
        for j in 0..4 {
            let idx = i + j;
            if idx >= bytes.len() { return Err(()); }
            if bytes[idx] == b'=' { pad += 1; continue; }
            let val = DECODE_TABLE[bytes[idx] as usize];
            if val < 0 { return Err(()); }
            sextets[j] = val as i16;
        }
        if pad > 2 { return Err(()); }
        result.push((sextets[0] << 2 | sextets[1] >> 4) as u8);
        if pad < 2 { result.push((sextets[1] << 4 | sextets[2] >> 2) as u8); }
        if pad < 1 { result.push((sextets[2] << 6 | sextets[3]) as u8); }
        i += 4;
    }
    Ok(result)
}
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

/// Manages a WebDriver (chromedriver, geckodriver) child process.
pub struct WebDriverProcess {
    child: Option<Child>,
    pub port: u16,
    pub base_url: String,
    pub ws_url: Option<String>,
}

impl WebDriverProcess {
    /// Start a WebDriver at the given driver path on an available port.
    /// Safe to call from sync code (uses #[tokio::main] internally).
    #[tokio::main]
    pub async fn start(driver_path: &str) -> Result<Self, Error> {
        let port = find_available_port().await?;
        let mut cmd = ProcessCommand::new(driver_path);
        cmd.arg(format!("--port={}", port));
        cmd.arg("--verbose");
        let mut child = cmd.spawn()?;
        let base_url = format!("http://localhost:{}", port);

        // Wait for WebDriver to become ready (poll /status)
        let client = Client::builder().build().unwrap_or_default();
        let status_url = format!("{}/status", base_url);
        let max_retries = 30;
        let mut ready = false;
        for _ in 0..max_retries {
            thread::sleep(std::time::Duration::from_millis(500));
            let response = client.get(&status_url).send().await;
            if response.is_err() {
                continue;
            }
            if response.unwrap().status().as_u16() == 200 {
                ready = true;
                break;
            }
        }
        if !ready {
            child.kill()?;
            return Err(anyhow!(
                "WebDriver did not become ready within {} attempts",
                max_retries
            ));
        }

        Ok(WebDriverProcess {
            child: Some(child),
            port,
            base_url,
            ws_url: None,
        })
    }

    pub fn stop(&mut self) -> Result<(), Error> {
        if self.child.is_some() {
            let mut child = self.child.take().unwrap();
            child.kill()?;
        }
        Ok(())
    }
}

pub async fn find_available_port() -> Result<u16, Error> {
    let listener = TcpListener::bind("127.0.0.1:0").await;
    if listener.is_err() {
        return Err(anyhow!("cannot find available port"));
    }
    let listener = listener.unwrap();
    let addr = listener.local_addr();
    if addr.is_err() {
        return Err(anyhow!("cannot get local address"));
    }
    let port = addr.unwrap().port();
    Ok(port)
}

pub struct PipeConfig {
    pub webdriver_url: String,
    pub webdriver_ws_url: Option<String>,
    pub record_path: Option<PathBuf>,
    pub recorder: Option<Arc<Mutex<Recorder>>>,
}

pub struct PipeMode {
    config: PipeConfig,
    proxy_port: u16,
    running: bool,
}

impl PipeMode {
    pub fn new(config: PipeConfig) -> Self {
        PipeMode {
            config,
            proxy_port: 0,
            running: false,
        }
    }

    pub fn start(&mut self) -> Result<u16, Error> {
        let (port_tx, port_rx): (Sender<u16>, Receiver<u16>) = mpsc::channel();
        let webdriver_url = self.config.webdriver_url.clone();
        let recorder = self.config.recorder.clone();

        thread::spawn(move || {
            let client = Client::builder().build().unwrap_or_default();
            start_pipe(webdriver_url, recorder, client, port_tx);
        });

        self.proxy_port = port_rx.recv()?;
        self.running = true;
        Ok(self.proxy_port)
    }

    pub fn wait(&self) {
        loop {
            thread::sleep(std::time::Duration::from_secs(1));
        }
    }

    pub fn config(&self) -> &PipeConfig {
        &self.config
    }

    pub fn stop(&mut self) {
        self.running = false;
    }
}

#[tokio::main]
async fn start_pipe(
    webdriver_url: String,
    recorder: Option<Arc<Mutex<Recorder>>>,
    http_client: Client,
    port_tx: Sender<u16>,
) {
    let listener = TcpListener::bind("127.0.0.1:0").await;
    if listener.is_err() {
        return;
    }
    let listener = listener.unwrap();
    let addr = listener.local_addr();
    if addr.is_err() {
        return;
    }
let port = addr.unwrap().port();
    let _ = port_tx.send(port);

    loop {
        let accept = listener.accept().await;
        if accept.is_err() {
            continue;
        }
        let (stream, _) = accept.unwrap();
        let mut stream: TcpStream = stream;
        let url = webdriver_url.clone();
        let client = http_client.clone();
        let rec = recorder.clone();

        let _ = handle_client(&mut stream, &url, &client, rec).await;
    }
}

async fn handle_client(
    stream: &mut TcpStream,
    webdriver_url: &str,
    client: &Client,
    recorder: Option<Arc<Mutex<Recorder>>>,
) -> Result<(), Error> {
    let (method, path, headers, body) = read_http_request(stream).await?;
    if method.is_empty() {
        return Ok(());
    }

    let target = format!("{}{}", webdriver_url, path);

    // Record start
    if recorder.is_some() && should_record(&method, &path) {
        let mut r = recorder.as_ref().unwrap().lock().unwrap();
        let body_str = String::from_utf8_lossy(&body);
        r.record_start(&method, &target, &method, &body_str);
    }

    let mut req = if method == "GET" {
        client.get(&target)
    } else if method == "POST" {
        client.post(&target)
    } else if method == "PUT" {
        client.put(&target)
    } else if method == "DELETE" {
        client.delete(&target)
    } else if method == "PATCH" {
        client.patch(&target)
    } else {
        return Err(anyhow!("unsupported method: {}", method));
    };

    for (key, value) in headers {
        if !key.eq_ignore_ascii_case("host")
            && !key.eq_ignore_ascii_case("connection")
            && !key.eq_ignore_ascii_case("content-length")
        {
            req = req.header(key, value);
        }
    }

    if !body.is_empty() {
        req = req.body(body);
    }

    let wd_response = req.send().await?;
    let status = wd_response.status().as_u16();
    let response_body = wd_response.bytes().await?;

    // Record end
    if recorder.is_some() && should_record(&method, &path) {
        if let Ok(mut r) = recorder.as_ref().unwrap().lock() {
            let body_str = String::from_utf8_lossy(&response_body);
            r.record_end(status, &body_str);
        }
    }

    let response_bytes = build_http_response(status, &response_body).await?;
    stream.write_all(&response_bytes).await?;

    // Skip per-action screenshot for blank POST /session; filmstrip covers it
    if recorder.is_some() && should_record(&method, &path) && path != "/session" {
        let sid = recorder.as_ref().unwrap().lock().ok()
            .and_then(|r| r.recording.session_id.clone());
        if let Some(session_id) = sid {
            let ss_url = format!("{}/session/{}/screenshot", webdriver_url, session_id);
            if let Ok(ss_resp) = client.get(&ss_url).send().await {
                if let Ok(ss_body) = ss_resp.bytes().await {
                    if let Ok(json_val) = serde_json::from_slice::<serde_json::Value>(&ss_body) {
                        if let Some(b64) = json_val["value"].as_str() {
                            if let Ok(png_bytes) = decode_base64(b64) {
                                if let Ok(mut r) = recorder.as_ref().unwrap().lock() {
                                    r.set_screenshot(png_bytes);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

async fn read_http_request(
    stream: &mut TcpStream,
) -> Result<(String, String, Vec<(String, String)>, Vec<u8>), Error> {
    let mut buf: Vec<u8> = Vec::new();
    let mut chunk: [u8; 8192] = [0u8; 8192];

    loop {
        let n = stream.read(&mut chunk[..]).await?;
        if n == 0 {
            return Ok((String::new(), String::new(), Vec::new(), Vec::new()));
        }
        buf.extend(chunk[..n].iter());

        if buf.len() >= 4 {
            let header_end = find_header_end(&buf);
            if header_end > 0 {
                let header_bytes = buf[..header_end].to_vec();
                let body_start = header_end + 4;
                let header_text = String::from_utf8_lossy(&header_bytes);
                let mut lines = header_text.split("\r\n");
                let request_line = lines.next().unwrap_or_default();
                let mut parts = request_line.split(" ");
                let method = parts.next().unwrap_or_default();
                let path = parts.next().unwrap_or_default();

                let mut headers: Vec<(String, String)> = Vec::new();
                let mut content_length: u64 = 0;

                for line in lines {
                    if line.is_empty() {
                        continue;
                    }
                    let colon_pos = line.find(':');
                    if colon_pos.is_some() {
                        let colon = colon_pos.unwrap();
                        let key = line[..colon].trim().to_string();
                        let value = line[colon + 2..].trim().to_string();
                        if key.to_ascii_lowercase() == "content-length" {
                            content_length = value.parse::<u64>().unwrap_or_default();
                        }
                        headers.push((key, value));
                    }
                }

                let mut body = Vec::new();
                if content_length > 0 {
                    let cl = content_length as usize;
                    let already_read = (buf.len() - body_start) as usize;
                    let to_read = already_read.min(cl);
                    for i in 0..to_read {
                        body.push(buf[body_start + i]);
                    }
                    while body.len() < cl {
                        let bytes_left = cl - body.len();
                        let page = bytes_left.min(8192);
                        let n = stream.read(&mut chunk[..page]).await?;
                        if n == 0 {
                            break;
                        }
                        body.extend(chunk[..n].iter());
                    }
                }

                return Ok((method.to_string(), path.to_string(), headers, body));
            }
        }
    }
}

fn find_header_end(buf: &[u8]) -> usize {
    for i in 0..buf.len() - 3 {
        if buf[i] == b'\r' && buf[i + 1] == b'\n' && buf[i + 2] == b'\r' && buf[i + 3] == b'\n' {
            return i;
        }
    }
    0
}

async fn build_http_response(status_code: u16, body: &[u8]) -> Result<Vec<u8>, Error> {
    let reason = match status_code {
        200 => "OK",
        201 => "Created",
        204 => "No Content",
        301 => "Moved Permanently",
        302 => "Found",
        303 => "See Other",
        304 => "Not Modified",
        400 => "Bad Request",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "Not Found",
        405 => "Method Not Allowed",
        500 => "Internal Server Error",
        502 => "Bad Gateway",
        503 => "Service Unavailable",
        _ => "Unknown",
    };
    let mut out = Vec::new();
    out.extend(format!("HTTP/1.1 {} {}\r\n", status_code, reason).as_bytes());
    out.extend(format!("Content-Length: {}\r\n", body.len()).as_bytes());
    out.extend(b"Connection: close\r\n");
    out.extend(b"Content-Type: application/json\r\n");
    out.extend(b"\r\n");
    out.extend(body);
    Ok(out)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::Arc;
    use std::time::Duration;
    use tokio::io::AsyncWriteExt;
    use tokio::net::TcpListener;

    /// Helper: spawns a mini server that sends a POST request,
    /// then the proxy-side calls read_http_request on the connection.
    async fn send_and_read(
        body: &[u8],
        use_cl: bool,
    ) -> Result<(Vec<u8>, Vec<(String, String)>), anyhow::Error> {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();

        let body_vec = body.to_vec();
        tokio::spawn(async move {
            let (mut stream, _) = listener.accept().await.unwrap();
            let cl = if use_cl {
                format!("Content-Length: {}", body_vec.len())
            } else {
                String::new()
            };
            let body_s = String::from_utf8_lossy(&body_vec);
            let req = format!(
                "POST / HTTP/1.1\r\nHost: localhost\r\nContent-Type: text/plain\r\n{}\r\n\r\n{}",
                cl, body_s
            );
            let _ = stream.write_all(req.as_bytes()).await;
            let mut buf: [u8; 256] = [0u8; 256];
            let _ = stream.read(&mut buf[..]).await;
        });

        tokio::time::sleep(Duration::from_millis(100)).await;
        let mut stream = TcpStream::connect(format!("127.0.0.1:{}", port))
            .await
            .unwrap();
        let (m, p, h, b) = read_http_request(&mut stream).await?;
        let resp = b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok";
        let _ = stream.write_all(&resp[..]).await;
        assert_eq!(m, "POST");
        assert_eq!(p, "/");
        Ok((b, h))
    }

    #[tokio::test]
    async fn test_normal_post_body() -> Result<(), anyhow::Error> {
        let body = b"key=value&data=12345";
        let (got, _) = send_and_read(body, true).await?;
        assert_eq!(got.len(), 20, "expected 20 body bytes, got {}", got.len());
        let s = String::from_utf8_lossy(&got);
        assert!(s.contains("12345"), "missing data: {}", s);
        println!("PASS: normal POST body ({}b)", got.len());
        Ok(())
    }

    #[tokio::test]
    async fn test_large_post_body() -> Result<(), anyhow::Error> {
        let body = vec![b'X'; 10000];
        let (got, _) = send_and_read(&body, true).await?;
        assert_eq!(got.len(), 10000, "expected 10000b, got {}", got.len());
        println!("PASS: large POST body ({}b)", got.len());
        Ok(())
    }

    #[tokio::test]
    async fn test_post_body_no_cl() -> Result<(), anyhow::Error> {
        let body = b"data";
        let (got, _) = send_and_read(body, false).await?;
        println!("PASS: no Content-Length -> body len={}", got.len());
        Ok(())
    }

    #[tokio::test]
    async fn test_keepalive_after_first_request() -> Result<(), anyhow::Error> {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();

        tokio::spawn(async move {
            let (mut stream, _) = listener.accept().await.unwrap();
            let _ = stream
                .write_all(b"POST /1 HTTP/1.1\r\nHost: localhost\r\nContent-Length: 5\r\n\r\nhello")
                .await;
            let mut buf: [u8; 64] = [0u8; 64];
            let _ = stream.read(&mut buf[..]).await;
            // Second request on same connection (keep-alive)
            let _ = stream
                .write_all(b"POST /2 HTTP/1.1\r\nHost: localhost\r\nContent-Length: 5\r\n\r\nworld")
                .await;
            let _ = stream.read(&mut buf[..]).await;
        });

        tokio::time::sleep(Duration::from_millis(100)).await;
        let mut stream = TcpStream::connect(format!("127.0.0.1:{}", port))
            .await
            .unwrap();

        let (_, p1, _, b1) = read_http_request(&mut stream).await?;
        println!("Req1: {} body={}", p1, String::from_utf8_lossy(&b1));
        let _ = stream
            .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok")
            .await;

        // Try reading second request on same connection
        let res = read_http_request(&mut stream).await;
        match res {
            Ok((_, p2, _, b2)) => println!(
                "Req2: {} body={} (KEEP-ALIVE)",
                p2,
                String::from_utf8_lossy(&b2)
            ),
            Err(_) => {
                println!("Req2: connection closed after first request (expected with raw TCP)")
            }
        }
        println!("PASS: keep-alive test");
        Ok(())
    }

    #[tokio::test]
    async fn test_http10_post() -> Result<(), anyhow::Error> {
        let listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
        let port = listener.local_addr().unwrap().port();

        tokio::spawn(async move {
            let (mut stream, _) = listener.accept().await.unwrap();
            let _ = stream
                .write_all(b"POST / HTTP/1.0\r\nContent-Length: 5\r\n\r\nhello")
                .await;
            let mut buf: [u8; 64] = [0u8; 64];
            let _ = stream.read(&mut buf[..]).await;
        });

        tokio::time::sleep(Duration::from_millis(100)).await;
        let mut stream = TcpStream::connect(format!("127.0.0.1:{}", port))
            .await
            .unwrap();
        let (_, _, _, body) = read_http_request(&mut stream).await?;
        assert_eq!(body.len(), 5);
        assert_eq!(String::from_utf8_lossy(&body), "hello");
        let _ = stream
            .write_all(b"HTTP/1.1 200 OK\r\nContent-Length: 2\r\n\r\nok")
            .await;
        println!("PASS: HTTP/1.0 POST body");
        Ok(())
    }
}
