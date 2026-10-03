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


use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone)]
pub struct RecordedAction {
    pub command: String,
    pub url: String,
    pub method: String,
    pub request_body: String,
    pub response_body: String,
    pub status: u16,
    pub timestamp: u64,
    pub duration_ms: u64,
    pub screenshot_bytes: Option<Vec<u8>>,
}

#[derive(Clone)]
pub struct ConsoleLog {
    pub timestamp: u64,
    pub level: String,
    pub message: String,
    pub url: String,
    pub line_number: u32,
    pub column_number: u32,
}

#[derive(Clone)]
pub struct Recording {
    pub path: PathBuf,
    pub actions: Vec<RecordedAction>,
    pub session_id: Option<String>,
    pub start_time: u64,
    pub browser_name: String,
    pub platform: String,
    pub title: String,
    pub console_logs: Vec<ConsoleLog>,
}

#[derive(Clone)]
pub struct Recorder {
    pub recording: Recording,
    current_action_start: u64,
}

impl Recorder {
    pub fn new(path: PathBuf) -> Self {
        Recorder {
            recording: Recording {
                path,
                actions: Vec::new(),
                session_id: None,
                start_time: now_millis(),
                browser_name: String::new(),
                platform: String::new(),
                title: String::new(),
                console_logs: Vec::new(),
            },
            current_action_start: 0,
        }
    }

    pub fn set_metadata(&mut self, browser_name: &str, platform: &str, title: &str) {
        self.recording.browser_name = browser_name.to_string();
        self.recording.platform = platform.to_string();
        self.recording.title = title.to_string();
    }

    pub fn record_start(&mut self, command: &str, url: &str, method: &str, body: &str) {
        self.current_action_start = now_millis();
        self.recording.actions.push(RecordedAction {
            command: command.to_string(),
            url: url.to_string(),
            method: method.to_string(),
            request_body: body.to_string(),
            response_body: String::new(),
            status: 0,
            timestamp: self.current_action_start,
            duration_ms: 0,
            screenshot_bytes: None,
        });

        if self.recording.session_id.is_none() {
            let sid = extract_session_id(body);
            if sid.is_some() {
                self.recording.session_id = sid;
            }
        }
    }

    pub fn record_end(&mut self, status: u16, response_body: &str) {
        if self.recording.actions.is_empty() {
            return;
        }
        let len = self.recording.actions.len();
        let end = now_millis();
        self.recording.actions[len - 1].duration_ms = end - self.current_action_start;
        self.recording.actions[len - 1].status = status;
        self.recording.actions[len - 1].response_body = response_body.to_string();

        if self.recording.session_id.is_none() && !response_body.is_empty() {
            let sid = extract_session_id(response_body);
            if sid.is_some() {
                self.recording.session_id = sid;
            }
        }
    }

    pub fn add_console_log(&mut self, level: &str, message: &str, url: &str, line: u32, col: u32) {
        self.recording.console_logs.push(ConsoleLog {
            timestamp: now_millis(),
            level: level.to_string(),
            message: message.to_string(),
            url: url.to_string(),
            line_number: line,
            column_number: col,
        });
    }

    pub fn set_screenshot(&mut self, bytes: Vec<u8>) {
        if self.recording.actions.is_empty() {
            return;
        }
        let len = self.recording.actions.len();
        self.recording.actions[len - 1].screenshot_bytes = Some(bytes);
    }

    pub fn has_actions(&self) -> bool {
        !self.recording.actions.is_empty()
    }
}

fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_millis()
        .try_into()
        .unwrap()
}

fn extract_session_id(body: &str) -> Option<String> {
    if body.is_empty() || !body.contains("sessionId") {
        return None;
    }
    let parsed = serde_json::from_str::<serde_json::Value>(body);
    if parsed.is_err() {
        return None;
    }
    let root = parsed.unwrap();
    let sid = root["value"]["sessionId"].clone();
    if let Some(s) = sid.as_str() {
        Some(s.to_string())
    } else {
        None
    }
}

pub fn should_record(method: &str, _path: &str) -> bool {
    method != "GET"
}

pub fn is_action_command(path: &str) -> bool {
    if path.ends_with("/url") { return true; }
    if path.contains("/elements") { return true; }
    if path.contains("/element") && !path.contains("/elements") { return true; }
    if path.contains("/click") { return true; }
    if path.contains("/actions") { return true; }
    if path.contains("/back") { return true; }
    if path.contains("/forward") { return true; }
    if path.contains("/refresh") { return true; }
    if path.contains("/keys") { return true; }
    if path.contains("/value") { return true; }
    if path.contains("/window") { return true; }
    if path.contains("/frame") { return true; }
    false
}
