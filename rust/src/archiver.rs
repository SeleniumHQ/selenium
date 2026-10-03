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

use std::fs::File;
use std::io::Write;
use serde_json::json;

use crate::recorder::Recording;
use zip::CompressionMethod;
use zip::write::{SimpleFileOptions, ZipWriter};

fn action_class(url: &str) -> (String, String) {
    let p = url.to_ascii_lowercase();
    // Find the path portion after the session ID
    let mut path = p.clone();
    let session_marker = "/session/";
    let session_start = path.find(session_marker);
    if session_start.is_some() {
        let after_session = session_start.unwrap() + session_marker.len();
        if after_session < path.len() {
            let rest = &path.as_str()[after_session..];
            let slash = rest.find('/');
            if slash.is_some() {
                path = rest[slash.unwrap()..].to_string();
            }
        }
    }

    if path.ends_with("/url") {
        return ("Page".to_string(), "navigate".to_string());
    }
    if path.ends_with("/back") {
        return ("Page".to_string(), "goBack".to_string());
    }
    if path.ends_with("/forward") {
        return ("Page".to_string(), "goForward".to_string());
    }
    if path.ends_with("/click") {
        return ("Element".to_string(), "click".to_string());
    }
    if path.ends_with("/value") || path.contains("/keys") {
        return ("Element".to_string(), "fill".to_string());
    }
    if path.contains("/element") && !path.contains("/elements") {
        return ("Page".to_string(), "find".to_string());
    }
    if path.ends_with("/elements") {
        return ("Page".to_string(), "find".to_string());
    }
    if path.ends_with("/refresh") {
        return ("Page".to_string(), "reload".to_string());
    }
    if path.contains("/execute/sync") || path.contains("/execute/async") {
        return ("Page".to_string(), "evaluate".to_string());
    }
    if path.contains("/window") || path.contains("/frame") || path.contains("/actions") {
        return ("Page".to_string(), "other".to_string());
    }
    (String::new(), String::new())
}

pub fn package(recording: &Recording) -> Result<(), anyhow::Error> {
    let output = recording.path.as_path();
    if output.exists() {
        std::fs::remove_file(output)?;
    }

    let file = File::create(output)?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default().compression_method(CompressionMethod::Stored);

    // trace.trace: NDJSON with context-options, before/after events
    let mut trace_lines: Vec<u8> = Vec::new();
    append_ndjson(&mut trace_lines, context_options(recording));

    let sid = recording.session_id.as_deref().unwrap_or("default");
    let context_id = format!("context@{}", sid);
    let page_id = format!("page@{}", sid);

    for (i, action) in recording.actions.iter().enumerate() {
        let call_id = format!("call@{}", i + 1);
        let start_time = action.timestamp.saturating_sub(recording.start_time);
        let (act_class, act_method) = action_class(&action.url);
        let display_method = if act_method.is_empty() {
            String::from("webdriver.send")
        } else {
            format!("{}.{}", act_class.to_ascii_lowercase(), act_method)
        };
        let display_class = if act_class.is_empty() { "Selenium" } else { &act_class };
        let title = if !act_class.is_empty() {
            format!("{}.{}", act_class, act_method)
        } else {
            format!("{} {}", action.method, shorten_path(&action.url))
        };

        let mut params = json!({
            "method": action.method,
            "path": action.url,
            "request_body": action.request_body,
        });
        // Extract semantic values from request_body for display in viewer
        let body = &action.request_body;
        if !body.is_empty() {
            if let Ok(val) = serde_json::from_str::<serde_json::Value>(body) {
                if act_method == "fill" {
                    if let Some(ref arr) = val["value"].as_array() {
                        let mut joined = String::new();
                        for i in 0..arr.len() {
                            if let Some(ref part) = arr[i].as_str() {
                                joined = format!("{}{}", joined, part);
                            }
                        }
                        if !joined.is_empty() {
                            params = json!({
                                "method": action.method,
                                "path": action.url,
                                "request_body": action.request_body,
                                "value": joined,
                            });
                        }
                    }
                } else if act_method == "navigate" {
                    if let Some(ref u) = val["url"].as_str() {
                        params = json!({
                            "method": action.method,
                            "path": action.url,
                            "request_body": action.request_body,
                            "url": u,
                        });
                    }
                }
            }
        }

        append_ndjson(&mut trace_lines, json!({
            "type": "before",
            "title": title,
            "callId": call_id,
            "startTime": start_time,
            "class": display_class,
            "method": display_method,
            "pageId": page_id,
            "contextId": context_id,
            "parentId": null,
            "params": params,
        }));

        append_ndjson(&mut trace_lines, json!({
            "type": "after",
            "callId": call_id,
            "endTime": start_time + action.duration_ms,
        }));

        // Per-action screenshot
        if let Some(ref ss_bytes) = action.screenshot_bytes {
            let ss_name = format!("page@{}-action-{}.png", sid, i);
            let ss_file = format!("resources/{}", ss_name);
            append_ndjson(&mut trace_lines, json!({
                "type": "screencast-frame",
                "pageId": page_id,
                "sha1": ss_name,
                "file": ss_file,
                "width": 1280,
                "height": 720,
                "timestamp": start_time,
            }));
            let _ = zip.start_file(&ss_file, options);
            let _ = zip.write_all(ss_bytes);
        }
    }

    // Console logs (dual format for Vibium and Playwright)
    for log in &recording.console_logs {
        let log_time = log.timestamp.saturating_sub(recording.start_time);
        // Format for Playwright viewer (type: console)
        append_ndjson(&mut trace_lines, json!({
            "type": "console",
            "time": log_time,
            "pageId": page_id,
            "messageType": log.level,
            "text": log.message,
            "location": {
                "url": log.url,
                "lineNumber": log.line_number,
                "columnNumber": log.column_number,
            },
        }));
        // Format for Vibium viewer (type: event, method: log.entryAdded)
        append_ndjson(&mut trace_lines, json!({
            "type": "event",
            "method": "log.entryAdded",
            "time": log_time,
            "pageId": page_id,
            "params": {
                "text": log.message,
                "type": log.level,
                "location": {
                    "url": log.url,
                    "lineNumber": log.line_number,
                    "columnNumber": log.column_number,
                },
            },
        }));
    }

    zip.start_file("trace.trace", options)?;
    zip.write_all(&trace_lines)?;

    // trace.network: NDJSON with resource snapshots (minimal)
    let mut network_lines: Vec<u8> = Vec::new();
    for action in &recording.actions {
        let url = &action.url;
        let status = action.status;
        let method = &action.method;
        if status > 0 && !url.is_empty() {
            let net_time = action.timestamp.saturating_sub(recording.start_time);
            let status_text = if status == 200 { "OK" } else if status == 201 { "Created" } else if status == 204 { "No Content" } else if status == 400 { "Bad Request" } else if status == 404 { "Not Found" } else if status == 500 { "Internal Server Error" } else { "Unknown" };
            append_ndjson(&mut network_lines, json!({
                "type": "resource-snapshot",
                "time": net_time,
                "snapshot": {
                    "_monotonicTime": net_time,
                    "request": {
                        "method": method,
                        "url": url,
                        "headers": [],
                        "cookies": [],
                        "headersSize": 0,
                        "bodySize": 0,
                        "queryString": [],
                        "httpVersion": "HTTP/1.1",
                    },
                    "response": {
                        "status": status,
                        "statusText": status_text,
                        "headers": [],
                        "cookies": [],
                        "headersSize": 0,
                        "bodySize": 0,
                        "content": {
                            "size": 0,
                            "mimeType": "application/json",
                        },
                    },
                }
            }));
        }
    }
    zip.start_file("trace.network", options)?;
    zip.write_all(&network_lines)?;

    zip.finish()?;
    Ok(())
}

fn append_ndjson(buf: &mut Vec<u8>, value: serde_json::Value) {
    buf.extend(serde_json::to_string(&value).unwrap().as_bytes());
    buf.push(b'\n');
}

fn context_options(recording: &Recording) -> serde_json::Value {
    let sid = recording.session_id.as_deref().unwrap_or("default");
    json!({
        "version": 9,
        "type": "context-options",
        "origin": "library",
        "libraryName": "selenium",
        "libraryVersion": "4.51.0",
        "browserName": recording.browser_name,
        "platform": recording.platform,
        "wallTime": recording.start_time,
        "monotonicTime": 0,
        "sdkLanguage": "java",
        "title": recording.title,
        "contextId": format!("context@{}", sid),
        "options": {
            "viewport": {"height": 720, "width": 1280}
        },
    })
}

fn shorten_path(full_url: &str) -> &str {
    // Extract the path from a URL
    if let Some(start) = full_url.find("://") {
        let after_host = &full_url[start + 3..];
        if let Some(slash) = after_host.find('/') {
            return &after_host[slash..];
        }
    }
    full_url
}
