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

use anyhow::Error;
use anyhow::anyhow;
use reqwest::Client;
use std::path::PathBuf;
use std::process::{Child, Command as ProcessCommand};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};
use std::thread;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};

/// Manages a WebDriver (chromedriver, geckodriver) child process.
pub struct WebDriverProcess {
    child: Child,
    pub port: u16,
    pub base_url: String,
    pub ws_url: Option<String>,
}

impl WebDriverProcess {
    /// Start a WebDriver at the given driver path on an available port.
    /// Async: call from within a tokio runtime (e.g. inside start_pipe).
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
            return Err(anyhow!("WebDriver did not become ready within {} attempts", max_retries));
        }

        Ok(WebDriverProcess {
            child,
            port,
            base_url,
            ws_url: None,
        })
    }

    pub fn stop(&mut self) -> Result<(), Error> {
        self.child.kill()?;
        Ok(())
    }
}

pub async fn find_available_port() -> Result<u16, Error> {
    let listener = TcpListener::bind("0.0.0.0:0").await;
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

        thread::spawn(move || {
            let client = Client::builder().build().unwrap_or_default();
            start_pipe(webdriver_url, client, port_tx);
        });

        self.proxy_port = port_rx.recv()?;
        self.running = true;
        Ok(self.proxy_port)
    }

    pub fn wait(&self) {
        loop {
            thread::sleep(std::time::Duration::from_secs(3600));
        }
    }
}

#[tokio::main]
async fn start_pipe(
    webdriver_url: String,
    http_client: Client,
    port_tx: Sender<u16>,
) {
    let listener = TcpListener::bind("0.0.0.0:0").await;
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

        let _ = handle_client(&mut stream, &url, &client).await;
    }
}

async fn handle_client(
    stream: &mut TcpStream,
    webdriver_url: &str,
    client: &Client,
) -> Result<(), Error> {
    let (method, path, headers, body) = read_http_request(stream).await?;
    if method.is_empty() {
        return Ok(());
    }

    let target = format!("{}{}", webdriver_url, path);

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
    let response_bytes = build_http_response(wd_response).await?;
    stream.write_all(&response_bytes).await?;
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

async fn build_http_response(response: reqwest::Response) -> Result<Vec<u8>, Error> {
    let status = response.status();
    let status_code = status.as_u16();

    // Collect headers before consuming body
    let mut header_pairs: Vec<(String, String)> = Vec::new();
    for (key, value) in response.headers() {
        let key_str = key.to_string();
        let val_str = value.to_str().unwrap_or_default().to_string();
        header_pairs.push((key_str, val_str));
    }

    let body = response.bytes().await?;

    let mut out = Vec::new();
    out.extend(format!("HTTP/1.1 {} OK\r\n", status_code).as_bytes());

    for (key_str, val_str) in header_pairs {
        let key_lower = key_str.to_ascii_lowercase();
        if key_lower == "content-encoding" || key_lower == "transfer-encoding" {
            continue;
        }
        out.extend(format!("{}: {}\r\n", key_str, val_str).as_bytes());
    }

    out.extend(format!("Content-Length: {}\r\n", body.len()).as_bytes());
    out.extend(b"\r\n");
    out.extend(body);
    Ok(out)
}