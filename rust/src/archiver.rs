use serde::Serialize;
use std::fs;

use crate::recorder::Recording;

pub fn package(recording: &Recording) -> Result<(), anyhow::Error> {
    let trace_json = build_trace_json(recording)?;
    let output = recording.path.as_path();

    fs::write(output, trace_json.as_bytes())?;
    Ok(())
}

fn build_trace_json(recording: &Recording) -> Result<String, anyhow::Error> {
    let mut commands = Vec::new();

    for i in 0..recording.actions.len() {
        let a = &recording.actions[i];
        let mut screenshot_file: Option<String> = None;

        if a.screenshot_bytes.is_some() {
            screenshot_file = Some(format!("screenshots/s{}.png", i));
        }

        commands.push(TraceCommand {
            r#type: a.command.clone(),
            action: format!("{} {}", a.method, a.url),
            timestamp: a.timestamp,
            duration: a.duration_ms,
            status: a.status,
            url: a.url.clone(),
            request_body: a.request_body.clone(),
            response_body: a.response_body.clone(),
            screenshot_file,
        });
    }

    let trace = TraceFile {
        r#type: "trace".to_string(),
        version: 2,
        pages: vec![TracePage {
            page_id: recording.session_id.clone().unwrap_or("default".to_string()),
            title: String::new(),
            url: String::new(),
            commands,
        }],
    };

    Ok(serde_json::to_string_pretty(&trace)?)
}

#[derive(Serialize)]
struct TraceCommand {
    r#type: String,
    action: String,
    timestamp: u64,
    duration: u64,
    status: u16,
    url: String,
    request_body: String,
    response_body: String,
    screenshot_file: Option<String>,
}

#[derive(Serialize)]
struct TracePage {
    page_id: String,
    title: String,
    url: String,
    commands: Vec<TraceCommand>,
}

#[derive(Serialize)]
struct TraceFile {
    r#type: String,
    version: u32,
    pages: Vec<TracePage>,
}