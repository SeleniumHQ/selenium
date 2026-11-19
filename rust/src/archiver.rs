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

//! Packages a [`Recording`] as a Playwright trace archive (`trace.trace`, `trace.network`
//! and `resources/`), readable by the Playwright trace viewer and the Vibium record player.

use crate::recorder::{RecordedAction, Recording, truncate};
use anyhow::Error;
use serde_json::{Value, json};
use std::fs::File;
use std::io::Write;
use zip::CompressionMethod;
use zip::write::{SimpleFileOptions, ZipWriter};

/// Schema v8 is the newest one understood by every viewer we target: Playwright modernizes it
/// to its current version on load, and the Vibium record player supports v6-v8 only.
pub const TRACE_SCHEMA_VERSION: u32 = 8;

const MAX_INLINE_JSON_LEN: usize = 4096;
const DEFAULT_VIEWPORT: (u32, u32) = (1280, 720);

pub fn package(recording: &Recording) -> Result<(), Error> {
    if let Some(parent) = recording.path.parent()
        && !parent.as_os_str().is_empty()
    {
        std::fs::create_dir_all(parent)?;
    }
    let file = File::create(&recording.path)?;
    let mut zip = ZipWriter::new(file);
    let stored = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);
    let compressed = SimpleFileOptions::default().compression_method(CompressionMethod::Deflated);

    let ids = TraceIds::new(recording);
    let mut timeline: Vec<(u64, Value)> = Vec::new();

    for (index, action) in recording.actions.iter().enumerate() {
        let call_id = format!("call@{}", index + 1);
        let start = relative(recording, action.start_time);
        let end = relative(recording, action.end_time.max(action.start_time));
        timeline.push((start, before_event(&ids, &call_id, start, action)));
        timeline.push((end, after_event(&call_id, end, action)));

        if let Some(screenshot) = &action.screenshot {
            // Viewers resolve screencast frames as `resources/<sha1>`; the name only needs to be
            // unique within the archive and keep an extension that reveals the image type.
            let resource = format!("{}-{}.png", ids.page_id.replace('@', "-"), index + 1);
            zip.start_file(format!("resources/{}", resource), stored)?;
            zip.write_all(&screenshot.data)?;
            let (width, height) = if screenshot.width > 0 {
                (screenshot.width, screenshot.height)
            } else {
                DEFAULT_VIEWPORT
            };
            let time = relative(recording, screenshot.timestamp);
            timeline.push((
                time,
                json!({
                    "type": "screencast-frame",
                    "pageId": ids.page_id,
                    "sha1": resource,
                    "width": width,
                    "height": height,
                    "timestamp": time,
                }),
            ));
        }
    }

    for message in &recording.console {
        let time = relative(recording, message.timestamp);
        timeline.push((
            time,
            json!({
                "type": "console",
                "time": time,
                "pageId": ids.page_id,
                "messageType": message.message_type,
                "text": message.text,
                "location": {
                    "url": message.url,
                    "lineNumber": message.line_number,
                    "columnNumber": message.column_number,
                },
            }),
        ));
    }

    // Stable sort keeps before/after pairs in order when they share a timestamp.
    timeline.sort_by_key(|(time, _)| *time);
    let mut trace = ndjson_line(&context_options(recording, &ids));
    for (_, event) in &timeline {
        trace.extend(ndjson_line(event));
    }
    zip.start_file("trace.trace", compressed)?;
    zip.write_all(&trace)?;

    let mut network = Vec::new();
    for entry in &recording.network {
        let start = relative(recording, entry.start_time);
        network.extend(ndjson_line(&json!({
            "type": "resource-snapshot",
            "snapshot": {
                "pageref": ids.page_id,
                "startedDateTime": iso_8601(entry.start_time),
                "time": entry.duration_ms,
                "_monotonicTime": start,
                "request": {
                    "method": entry.method,
                    "url": entry.url,
                    "httpVersion": "HTTP/1.1",
                    "cookies": [],
                    "headers": har_headers(&entry.request_headers),
                    "queryString": [],
                    "headersSize": -1,
                    "bodySize": -1,
                },
                "response": {
                    "status": entry.status,
                    "statusText": entry.status_text,
                    "httpVersion": "HTTP/1.1",
                    "cookies": [],
                    "headers": har_headers(&entry.response_headers),
                    "content": {"size": entry.body_size, "mimeType": entry.mime_type},
                    "redirectURL": "",
                    "headersSize": -1,
                    "bodySize": entry.body_size,
                },
                "cache": {},
                "timings": {"send": -1, "wait": entry.duration_ms, "receive": -1},
            }
        })));
    }
    zip.start_file("trace.network", compressed)?;
    zip.write_all(&network)?;

    zip.finish()?;
    Ok(())
}

struct TraceIds {
    context_id: String,
    page_id: String,
}

impl TraceIds {
    fn new(recording: &Recording) -> Self {
        let sid = recording.session_id.as_deref().unwrap_or("default");
        TraceIds {
            context_id: format!("context@{}", sid),
            page_id: format!("page@{}", sid),
        }
    }
}

fn context_options(recording: &Recording, ids: &TraceIds) -> Value {
    let (width, height) = recording
        .actions
        .iter()
        .find_map(|a| a.screenshot.as_ref().filter(|s| s.width > 0))
        .map(|s| (s.width, s.height))
        .unwrap_or(DEFAULT_VIEWPORT);
    let mut options = json!({
        "version": TRACE_SCHEMA_VERSION,
        "type": "context-options",
        "origin": "library",
        "browserName": recording.browser_name,
        "platform": recording.platform,
        "wallTime": recording.start_time,
        "monotonicTime": 0,
        "title": recording.title,
        "contextId": ids.context_id,
        "options": {"viewport": {"width": width, "height": height}},
    });
    if let Some(language) = &recording.sdk_language {
        options["sdkLanguage"] = json!(language);
    }
    options
}

fn before_event(ids: &TraceIds, call_id: &str, start: u64, action: &RecordedAction) -> Value {
    let mut params = json!({
        "method": action.http_method,
        "path": action.command_path,
    });
    if let Some(body) = &action.request_body
        && body.as_object().is_some_and(|o| !o.is_empty())
    {
        params["body"] = bounded(body);
    }
    json!({
        "type": "before",
        "callId": call_id,
        "stepId": call_id,
        "startTime": start,
        "title": action.info.title,
        "class": action.info.class,
        "method": action.info.method,
        "params": params,
        "pageId": ids.page_id,
    })
}

fn after_event(call_id: &str, end: u64, action: &RecordedAction) -> Value {
    let mut event = json!({
        "type": "after",
        "callId": call_id,
        "endTime": end,
    });
    let value = action.response_value.as_ref().unwrap_or(&Value::Null);
    if action.status >= 400 {
        event["error"] = json!({
            "name": value["error"].as_str().unwrap_or("WebDriverError"),
            "message": value["message"].as_str().unwrap_or("WebDriver command failed"),
        });
    } else if !value.is_null() {
        event["result"] = json!({"value": bounded(value)});
    }
    event
}

/// Keeps large payloads (scripts, page sources) from bloating the trace.
fn bounded(value: &Value) -> Value {
    let text = value.to_string();
    if text.len() <= MAX_INLINE_JSON_LEN {
        value.clone()
    } else {
        Value::String(truncate(&text, MAX_INLINE_JSON_LEN))
    }
}

fn har_headers(headers: &[(String, String)]) -> Value {
    Value::Array(
        headers
            .iter()
            .map(|(name, value)| json!({"name": name, "value": value}))
            .collect(),
    )
}

fn relative(recording: &Recording, timestamp: u64) -> u64 {
    timestamp.saturating_sub(recording.start_time)
}

fn ndjson_line(value: &Value) -> Vec<u8> {
    let mut line = value.to_string().into_bytes();
    line.push(b'\n');
    line
}

/// Formats Unix milliseconds as an ISO 8601 UTC timestamp, as required by HAR.
fn iso_8601(millis: u64) -> String {
    let secs = millis / 1000;
    let (hours, minutes, seconds) = ((secs / 3600) % 24, (secs / 60) % 60, secs % 60);
    // Civil-from-days conversion (Howard Hinnant's algorithm).
    let days = (secs / 86400) as i64 + 719_468;
    let era = days.div_euclid(146_097);
    let doe = days.rem_euclid(146_097);
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = yoe + era * 400 + i64::from(month <= 2);
    format!(
        "{:04}-{:02}-{:02}T{:02}:{:02}:{:02}.{:03}Z",
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        millis % 1000
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Read;
    use std::path::PathBuf;
    use zip::ZipArchive;

    fn sample_png(width: u32, height: u32) -> Vec<u8> {
        let mut png = b"\x89PNG\r\n\x1a\n\0\0\0\rIHDR".to_vec();
        png.extend(width.to_be_bytes());
        png.extend(height.to_be_bytes());
        png
    }

    fn read_entry(archive: &mut ZipArchive<File>, name: &str) -> String {
        let mut text = String::new();
        archive
            .by_name(name)
            .unwrap()
            .read_to_string(&mut text)
            .unwrap();
        text
    }

    #[test]
    fn writes_a_v8_trace_readable_by_playwright_and_vibium() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("nested").join("trace.zip");
        let mut rec = Recording::new(path.clone(), "chrome", "java");
        rec.session_id = Some("abc".into());

        let new_session = rec.start_action("POST", "", b"{}");
        rec.end_action(new_session, 200, br#"{"value":{"sessionId":"abc"}}"#);
        let nav = rec.start_action("POST", "/url", br#"{"url":"https://example.com"}"#);
        rec.end_action(nav, 200, br#"{"value":null}"#);
        rec.set_screenshot(nav, sample_png(800, 600));
        let find = rec.start_action(
            "POST",
            "/element",
            br##"{"using":"css selector","value":"#x"}"##,
        );
        rec.end_action(
            find,
            404,
            br#"{"value":{"error":"no such element","message":"nope"}}"#,
        );
        rec.add_bidi_event(
            "log.entryAdded",
            &json!({"type": "console", "method": "log", "text": "hi", "timestamp": rec.start_time}),
        );
        rec.add_bidi_event(
            "network.responseCompleted",
            &json!({"timestamp": rec.start_time, "request": {"url": "https://example.com/", "method": "GET"},
                    "response": {"status": 200, "statusText": "OK", "mimeType": "text/html"}}),
        );

        package(&rec).unwrap();

        let mut archive = ZipArchive::new(File::open(&path).unwrap()).unwrap();
        let events: Vec<Value> = read_entry(&mut archive, "trace.trace")
            .lines()
            .map(|l| serde_json::from_str(l).unwrap())
            .collect();

        assert_eq!(events[0]["type"], "context-options");
        assert_eq!(events[0]["version"], TRACE_SCHEMA_VERSION);
        assert_eq!(events[0]["sdkLanguage"], "java");
        assert_eq!(events[0]["options"]["viewport"]["width"], 800);

        let frame = events
            .iter()
            .find(|e| e["type"] == "screencast-frame")
            .unwrap();
        assert!(
            frame.get("file").is_none(),
            "v8 frames reference resources by sha1 only"
        );
        let resource = format!("resources/{}", frame["sha1"].as_str().unwrap());
        assert!(archive.by_name(&resource).is_ok(), "missing {}", resource);
        assert_eq!(frame["width"], 800);

        let navigate = events
            .iter()
            .find(|e| e["type"] == "before" && e["method"] == "goto")
            .unwrap();
        assert_eq!(navigate["title"], "Navigate to \"https://example.com\"");
        assert_eq!(navigate["stepId"], navigate["callId"]);

        let failed = events
            .iter()
            .find(|e| e["type"] == "after" && e.get("error").is_some())
            .unwrap();
        assert_eq!(failed["error"]["name"], "no such element");

        assert_eq!(events.iter().filter(|e| e["type"] == "console").count(), 1);

        let network = read_entry(&mut archive, "trace.network");
        let entry: Value = serde_json::from_str(network.lines().next().unwrap()).unwrap();
        assert_eq!(entry["snapshot"]["response"]["status"], 200);
        assert_eq!(entry["snapshot"]["request"]["url"], "https://example.com/");
    }

    #[test]
    fn formats_har_timestamps() {
        assert_eq!(iso_8601(0), "1970-01-01T00:00:00.000Z");
        assert_eq!(iso_8601(1_763_558_401_123), "2025-11-19T13:20:01.123Z");
    }

    #[test]
    fn overwrites_existing_trace() {
        let dir = tempfile::tempdir().unwrap();
        let path: PathBuf = dir.path().join("trace.zip");
        std::fs::write(&path, b"stale").unwrap();
        package(&Recording::new(path.clone(), "firefox", "")).unwrap();
        assert!(ZipArchive::new(File::open(&path).unwrap()).is_ok());
    }
}
