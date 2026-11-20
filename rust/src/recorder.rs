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

//! In-memory model of a recorded WebDriver session, filled by the pipe proxy
//! (WebDriver commands, screenshots) and by the BiDi client (console and network events).

use serde_json::Value;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct RecordedAction {
    pub http_method: String,
    /// Command path relative to the session, e.g. `/element/{id}/click`.
    pub command_path: String,
    pub request_body: Option<Value>,
    pub status: u16,
    pub response_value: Option<Value>,
    pub start_time: u64,
    pub end_time: u64,
    pub info: ActionInfo,
    pub screenshot: Option<Screenshot>,
}

pub struct Screenshot {
    pub data: Vec<u8>,
    pub width: u32,
    pub height: u32,
    pub timestamp: u64,
}

pub struct ConsoleMessage {
    pub timestamp: u64,
    pub message_type: String,
    pub text: String,
    pub url: String,
    pub line_number: u64,
    pub column_number: u64,
}

pub struct NetworkEntry {
    pub start_time: u64,
    pub duration_ms: f64,
    pub method: String,
    pub url: String,
    pub request_headers: Vec<(String, String)>,
    pub status: u64,
    pub status_text: String,
    pub response_headers: Vec<(String, String)>,
    pub mime_type: String,
    pub body_size: i64,
}

pub struct Recording {
    pub path: PathBuf,
    pub browser_name: String,
    pub platform: String,
    pub sdk_language: Option<String>,
    pub title: String,
    pub session_id: Option<String>,
    pub start_time: u64,
    pub bidi: bool,
    pub actions: Vec<RecordedAction>,
    pub console: Vec<ConsoleMessage>,
    pub network: Vec<NetworkEntry>,
}

impl Recording {
    pub fn new(path: PathBuf, browser_name: &str, language_binding: &str) -> Self {
        Recording {
            path,
            browser_name: browser_name.to_string(),
            platform: playwright_platform(std::env::consts::OS).to_string(),
            sdk_language: playwright_sdk_language(language_binding).map(str::to_string),
            title: format!("Selenium {} session", browser_name),
            session_id: None,
            start_time: now_millis(),
            bidi: false,
            actions: Vec::new(),
            console: Vec::new(),
            network: Vec::new(),
        }
    }

    /// Registers a command right before it is forwarded; returns its index for `end_action`.
    pub fn start_action(&mut self, http_method: &str, command_path: &str, body: &[u8]) -> usize {
        let request_body = serde_json::from_slice::<Value>(body).ok();
        let info = classify_command(http_method, command_path, request_body.as_ref());
        self.actions.push(RecordedAction {
            http_method: http_method.to_string(),
            command_path: command_path.to_string(),
            request_body,
            status: 0,
            response_value: None,
            start_time: now_millis(),
            end_time: 0,
            info,
            screenshot: None,
        });
        self.actions.len() - 1
    }

    /// Hides text typed into a password field, so secrets do not end up in shared traces.
    pub fn redact_typed_text(&mut self, index: usize) {
        if let Some(action) = self.actions.get_mut(index) {
            action.info.title = format!("Type \"{}\"", REDACTED);
            if let Some(body) = action.request_body.as_mut().and_then(Value::as_object_mut) {
                if body.contains_key("text") {
                    body.insert("text".into(), Value::String(REDACTED.into()));
                }
                if body.contains_key("value") {
                    body.insert("value".into(), Value::Array(vec![REDACTED.into()]));
                }
            }
        }
    }

    pub fn end_action(&mut self, index: usize, status: u16, response_body: &[u8]) {
        if let Some(action) = self.actions.get_mut(index) {
            action.status = status;
            action.end_time = now_millis();
            action.response_value = serde_json::from_slice::<Value>(response_body)
                .ok()
                .map(|v| v["value"].clone());
        }
    }

    pub fn set_screenshot(&mut self, index: usize, data: Vec<u8>) {
        if let Some(action) = self.actions.get_mut(index) {
            let (width, height) = png_dimensions(&data).unwrap_or((0, 0));
            action.screenshot = Some(Screenshot {
                data,
                width,
                height,
                timestamp: now_millis(),
            });
        }
    }

    pub fn add_classic_log_entry(&mut self, entry: &Value) {
        let Some(level) = entry["level"].as_str() else {
            return;
        };
        self.console.push(ConsoleMessage {
            timestamp: entry["timestamp"].as_u64().unwrap_or_else(now_millis),
            message_type: classic_level_to_console_type(level).to_string(),
            text: entry["message"].as_str().unwrap_or_default().to_string(),
            url: String::new(),
            line_number: 0,
            column_number: 0,
        });
    }

    /// Maps a WebDriver BiDi event into the recording. Unknown events are ignored.
    pub fn add_bidi_event(&mut self, method: &str, params: &Value) {
        match method {
            "log.entryAdded" => self.console.push(console_from_bidi(params)),
            "network.responseCompleted" => {
                if let Some(entry) = network_from_bidi(params) {
                    self.network.push(entry);
                }
            }
            _ => {}
        }
    }
}

/// How a WebDriver command is shown in the trace viewer.
#[derive(Debug, PartialEq)]
pub struct ActionInfo {
    pub class: &'static str,
    pub method: &'static str,
    pub title: String,
    /// Whether the command may change what is rendered, so a screenshot is worth taking.
    pub visual: bool,
}

impl ActionInfo {
    fn new(class: &'static str, method: &'static str, title: String, visual: bool) -> Self {
        ActionInfo {
            class,
            method,
            title,
            visual,
        }
    }
}

const MAX_TITLE_VALUE_LEN: usize = 80;
pub const REDACTED: &str = "********";

pub fn classify_command(http_method: &str, path: &str, body: Option<&Value>) -> ActionInfo {
    let field = |name: &str| -> String {
        body.and_then(|b| b[name].as_str())
            .map(|s| truncate(s, MAX_TITLE_VALUE_LEN))
            .unwrap_or_default()
    };
    let segments: Vec<&str> = path.trim_matches('/').split('/').collect();
    let last = segments.last().copied().unwrap_or_default();
    let element_scoped =
        segments.first() == Some(&"element") || segments.first() == Some(&"shadow");

    match (http_method, path) {
        ("POST", "") => {
            return ActionInfo::new("Browser", "newSession", "New session".into(), false);
        }
        ("DELETE", "") => return ActionInfo::new("Browser", "close", "Quit".into(), false),
        ("POST", "/url") => {
            let title = format!("Navigate to \"{}\"", field("url"));
            return ActionInfo::new("Frame", "goto", title, true);
        }
        ("POST", "/back") => return ActionInfo::new("Page", "goBack", "Go back".into(), true),
        ("POST", "/forward") => {
            return ActionInfo::new("Page", "goForward", "Go forward".into(), true);
        }
        ("POST", "/refresh") => return ActionInfo::new("Page", "reload", "Reload".into(), true),
        ("POST", "/execute/sync") | ("POST", "/execute/async") => {
            return ActionInfo::new("Frame", "evaluateExpression", "Execute script".into(), true);
        }
        ("POST", "/actions") => {
            return ActionInfo::new("Page", "performActions", "Perform actions".into(), true);
        }
        ("DELETE", "/actions") => {
            return ActionInfo::new("Page", "releaseActions", "Release actions".into(), true);
        }
        ("POST", "/window") => {
            return ActionInfo::new("Browser", "switchToWindow", "Switch to window".into(), true);
        }
        ("DELETE", "/window") => {
            return ActionInfo::new("Page", "close", "Close window".into(), true);
        }
        ("POST", "/window/new") => {
            return ActionInfo::new("BrowserContext", "newPage", "New window".into(), true);
        }
        ("POST", "/frame") => {
            return ActionInfo::new("Frame", "switchToFrame", "Switch to frame".into(), false);
        }
        ("POST", "/frame/parent") => {
            let title = "Switch to parent frame".into();
            return ActionInfo::new("Frame", "switchToParentFrame", title, false);
        }
        ("POST", "/alert/accept") => {
            return ActionInfo::new("Dialog", "accept", "Accept alert".into(), true);
        }
        ("POST", "/alert/dismiss") => {
            return ActionInfo::new("Dialog", "dismiss", "Dismiss alert".into(), true);
        }
        _ => {}
    }

    if http_method == "POST"
        && (last == "element" || last == "elements")
        && (segments.len() == 1 || element_scoped)
    {
        let plural = if last == "elements" {
            "elements"
        } else {
            "element"
        };
        let title = format!("Find {} ({}: {})", plural, field("using"), field("value"));
        let method = if last == "elements" {
            "querySelectorAll"
        } else {
            "querySelector"
        };
        return ActionInfo::new("Frame", method, title, false);
    }
    if http_method == "POST" && element_scoped && segments.len() == 3 {
        match last {
            "click" => return ActionInfo::new("Element", "click", "Click".into(), true),
            "clear" => return ActionInfo::new("Element", "clear", "Clear".into(), true),
            "value" => {
                let text: String = body
                    .and_then(|b| b["text"].as_str().map(str::to_string))
                    .or_else(|| {
                        body.and_then(|b| b["value"].as_array())
                            .map(|parts| parts.iter().filter_map(Value::as_str).collect::<String>())
                    })
                    .unwrap_or_default();
                let title = format!("Type \"{}\"", truncate(&text, MAX_TITLE_VALUE_LEN));
                return ActionInfo::new("Element", "fill", title, true);
            }
            _ => {}
        }
    }
    if path.starts_with("/window/") {
        let title = format!("Window {}", last);
        return ActionInfo::new("Page", "setViewportSize", title, true);
    }

    let title = format!(
        "{} {}",
        http_method,
        if path.is_empty() { "/" } else { path }
    );
    ActionInfo::new("WebDriver", "command", title, false)
}

fn console_from_bidi(params: &Value) -> ConsoleMessage {
    let message_type = if params["type"] == "console" {
        params["method"].as_str().unwrap_or("log")
    } else {
        // Uncaught exceptions ("javascript" entries) are reported as errors.
        "error"
    };
    let frame = &params["stackTrace"]["callFrames"][0];
    ConsoleMessage {
        timestamp: params["timestamp"].as_u64().unwrap_or_else(now_millis),
        message_type: message_type.to_string(),
        text: params["text"].as_str().unwrap_or_default().to_string(),
        url: frame["url"].as_str().unwrap_or_default().to_string(),
        line_number: frame["lineNumber"].as_u64().unwrap_or(0),
        column_number: frame["columnNumber"].as_u64().unwrap_or(0),
    }
}

fn network_from_bidi(params: &Value) -> Option<NetworkEntry> {
    let request = &params["request"];
    let response = &params["response"];
    let url = request["url"].as_str()?.to_string();
    let timings = &request["timings"];
    let request_time = timings["requestTime"].as_f64().unwrap_or(0.0);
    let response_end = timings["responseEnd"].as_f64().unwrap_or(0.0);
    let duration_ms = if request_time > 0.0 && response_end > request_time {
        response_end - request_time
    } else {
        0.0
    };
    let end = params["timestamp"].as_u64().unwrap_or_else(now_millis);
    Some(NetworkEntry {
        start_time: end.saturating_sub(duration_ms as u64),
        duration_ms,
        method: request["method"].as_str().unwrap_or("GET").to_string(),
        url,
        request_headers: bidi_headers(&request["headers"]),
        status: response["status"].as_u64().unwrap_or(0),
        status_text: response["statusText"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        response_headers: bidi_headers(&response["headers"]),
        mime_type: response["mimeType"]
            .as_str()
            .unwrap_or_default()
            .to_string(),
        body_size: response["bodySize"]
            .as_i64()
            .or_else(|| response["content"]["size"].as_i64())
            .unwrap_or(-1),
    })
}

fn bidi_headers(headers: &Value) -> Vec<(String, String)> {
    headers
        .as_array()
        .map(|list| {
            list.iter()
                .filter_map(|h| {
                    let name = h["name"].as_str()?;
                    let value = h["value"]["value"].as_str().unwrap_or_default();
                    Some((name.to_string(), value.to_string()))
                })
                .collect()
        })
        .unwrap_or_default()
}

fn classic_level_to_console_type(level: &str) -> &'static str {
    match level {
        "SEVERE" => "error",
        "WARNING" => "warning",
        "DEBUG" | "FINE" | "FINER" | "FINEST" => "debug",
        _ => "log",
    }
}

fn playwright_platform(os: &str) -> &str {
    match os {
        "macos" => "darwin",
        "windows" => "win32",
        other => other,
    }
}

fn playwright_sdk_language(binding: &str) -> Option<&'static str> {
    match binding.to_ascii_lowercase().as_str() {
        "java" => Some("java"),
        "python" => Some("python"),
        "javascript" => Some("javascript"),
        "dotnet" | "csharp" => Some("csharp"),
        _ => None,
    }
}

/// Reads width and height from the IHDR chunk of a PNG image.
pub fn png_dimensions(data: &[u8]) -> Option<(u32, u32)> {
    const SIGNATURE: &[u8] = b"\x89PNG\r\n\x1a\n";
    if data.len() < 24 || !data.starts_with(SIGNATURE) || &data[12..16] != b"IHDR" {
        return None;
    }
    let width = u32::from_be_bytes(data[16..20].try_into().ok()?);
    let height = u32::from_be_bytes(data[20..24].try_into().ok()?);
    Some((width, height))
}

pub fn truncate(text: &str, max_chars: usize) -> String {
    if text.chars().count() <= max_chars {
        return text.to_string();
    }
    let mut result: String = text.chars().take(max_chars).collect();
    result.push('…');
    result
}

pub fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn classifies_navigation_and_element_commands() {
        let nav = classify_command("POST", "/url", Some(&json!({"url": "https://example.com"})));
        assert_eq!(nav.title, "Navigate to \"https://example.com\"");
        assert!(nav.visual);

        let find = classify_command(
            "POST",
            "/element",
            Some(&json!({"using": "css selector", "value": "#my-id"})),
        );
        assert_eq!(find.title, "Find element (css selector: #my-id)");
        assert!(!find.visual);

        let nested = classify_command("POST", "/element/abc/elements", None);
        assert_eq!(nested.method, "querySelectorAll");

        let click = classify_command("POST", "/element/abc/click", Some(&json!({})));
        assert_eq!(click.method, "click");
        assert!(click.visual);

        let typed = classify_command(
            "POST",
            "/element/abc/value",
            Some(&json!({"text": "hello", "value": ["h", "e", "l", "l", "o"]})),
        );
        assert_eq!(typed.title, "Type \"hello\"");

        let quit = classify_command("DELETE", "", None);
        assert_eq!(quit.method, "close");
        assert!(!quit.visual);
    }

    #[test]
    fn redacts_typed_passwords() {
        let mut rec = Recording::new(PathBuf::from("t.zip"), "chrome", "java");
        let index = rec.start_action(
            "POST",
            "/element/e1/value",
            br#"{"text":"secret","value":["s","e","c","r","e","t"]}"#,
        );
        rec.redact_typed_text(index);
        let action = &rec.actions[index];
        assert_eq!(action.info.title, "Type \"********\"");
        let body = action.request_body.as_ref().unwrap().to_string();
        assert!(
            !body.contains("secret") && !body.contains("\"s\""),
            "{}",
            body
        );
    }

    #[test]
    fn unknown_commands_fall_back_to_raw_path() {
        let info = classify_command("POST", "/timeouts", None);
        assert_eq!(info.class, "WebDriver");
        assert_eq!(info.title, "POST /timeouts");
        assert!(!info.visual);
    }

    #[test]
    fn maps_bidi_console_entries() {
        let mut rec = Recording::new(PathBuf::from("t.zip"), "chrome", "java");
        rec.add_bidi_event(
            "log.entryAdded",
            &json!({
                "type": "console", "method": "warn", "level": "warn", "text": "careful",
                "timestamp": 1000,
                "stackTrace": {"callFrames": [{"url": "https://a/b.js", "lineNumber": 3, "columnNumber": 7}]}
            }),
        );
        rec.add_bidi_event(
            "log.entryAdded",
            &json!({"type": "javascript", "level": "error", "text": "boom", "timestamp": 1001}),
        );
        assert_eq!(rec.console.len(), 2);
        assert_eq!(rec.console[0].message_type, "warn");
        assert_eq!(rec.console[0].url, "https://a/b.js");
        assert_eq!(rec.console[0].line_number, 3);
        assert_eq!(rec.console[1].message_type, "error");
        assert_eq!(rec.console[1].text, "boom");
    }

    #[test]
    fn maps_bidi_network_responses() {
        let mut rec = Recording::new(PathBuf::from("t.zip"), "chrome", "java");
        rec.add_bidi_event(
            "network.responseCompleted",
            &json!({
                "timestamp": 5000,
                "request": {
                    "url": "https://example.com/", "method": "GET",
                    "headers": [{"name": "Accept", "value": {"type": "string", "value": "*/*"}}],
                    "timings": {"requestTime": 100.0, "responseEnd": 350.0}
                },
                "response": {"status": 200, "statusText": "OK", "mimeType": "text/html", "bodySize": 42, "headers": []}
            }),
        );
        let entry = &rec.network[0];
        assert_eq!(entry.url, "https://example.com/");
        assert_eq!(entry.status, 200);
        assert_eq!(entry.duration_ms, 250.0);
        assert_eq!(entry.start_time, 4750);
        assert_eq!(
            entry.request_headers,
            vec![("Accept".to_string(), "*/*".to_string())]
        );
    }

    #[test]
    fn reads_png_dimensions() {
        let mut png = b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR".to_vec();
        png.extend(800u32.to_be_bytes());
        png.extend(600u32.to_be_bytes());
        assert_eq!(png_dimensions(&png), Some((800, 600)));
        assert_eq!(png_dimensions(b"not a png"), None);
    }

    #[test]
    fn maps_language_bindings_to_playwright_sdk() {
        assert_eq!(playwright_sdk_language("java"), Some("java"));
        assert_eq!(playwright_sdk_language("dotnet"), Some("csharp"));
        assert_eq!(playwright_sdk_language("ruby"), None);
        assert_eq!(playwright_platform("macos"), "darwin");
    }
}
