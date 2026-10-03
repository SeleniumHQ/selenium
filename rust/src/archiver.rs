use serde::Serialize;
use std::fs::File;
use std::io::Write;
use std::io::BufWriter;

use crate::recorder::Recording;

pub fn package(recording: &Recording) -> Result<(), anyhow::Error> {
    let trace_json = build_trace_json(recording)?;
    let output = recording.path.as_path();
    if output.exists() {
        std::fs::remove_file(output)?;
    }

    let file = File::create(output)?;
    let mut writer = BufWriter::new(&file);

    let trace_bytes = trace_json.as_bytes();
    let name_bytes: &[u8] = b"trace.json";
    let crc = calc_crc32(trace_bytes);
    let size = trace_bytes.len() as u32;
    let name_len = name_bytes.len() as u16;

    // Local file header
    let mut header = Vec::new();
    write_le_u32(&mut header, 0x04034b50);
    write_le_u16(&mut header, 20);
    write_le_u16(&mut header, 0);
    write_le_u16(&mut header, 0);
    write_le_u16(&mut header, 0);
    write_le_u16(&mut header, 0);
    write_le_u32(&mut header, crc);
    write_le_u32(&mut header, size);
    write_le_u32(&mut header, size);
    write_le_u16(&mut header, name_len);
    write_le_u16(&mut header, 0);
    header.extend(name_bytes);

    let local_size = (22 + name_len) as u64;
    let total_size = local_size + trace_bytes.len() as u64;

    writer.write(&header)?;
    writer.write(trace_bytes)?;

    // Central directory entry
    let mut cent = Vec::new();
    write_le_u32(&mut cent, 0x02014b50);
    write_le_u16(&mut cent, 20);
    write_le_u16(&mut cent, 20);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u32(&mut cent, crc);
    write_le_u32(&mut cent, size);
    write_le_u32(&mut cent, size);
    write_le_u16(&mut cent, name_len);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u16(&mut cent, 0);
    write_le_u32(&mut cent, 0);
    write_le_u32(&mut cent, 0);
    cent.extend(name_bytes);

    writer.write(&cent)?;

    // End of central directory
    let mut eocd = Vec::new();
    write_le_u32(&mut eocd, 0x06054b50);
    write_le_u16(&mut eocd, 0);
    write_le_u16(&mut eocd, 0);
    write_le_u16(&mut eocd, 1);
    write_le_u16(&mut eocd, 1);
    write_le_u32(&mut eocd, cent.len() as u32);
    write_le_u32(&mut eocd, total_size as u32);
    write_le_u16(&mut eocd, 0);

    writer.write(&eocd)?;
    writer.flush()?;
    Ok(())
}

fn write_le_u16(buf: &mut Vec<u8>, value: u16) {
    buf.push((value & 0xff) as u8);
    buf.push(((value >> 8) & 0xff) as u8);
}

fn write_le_u32(buf: &mut Vec<u8>, value: u32) {
    buf.push((value & 0xff) as u8);
    buf.push(((value >> 8) & 0xff) as u8);
    buf.push(((value >> 16) & 0xff) as u8);
    buf.push(((value >> 24) & 0xff) as u8);
}

fn calc_crc32(data: &[u8]) -> u32 {
    let mut table: [u32; 256] = [0u32; 256];
    for i in 0..256 {
        let mut crc = i as u32;
        for _ in 0..8 {
            crc = if (crc & 1) != 0 { (crc >> 1) ^ 0xedb88320 } else { crc >> 1 };
        }
        table[i as usize] = crc;
    }
    let mut crc = 0xffffffffu32;
    for b in data {
        crc = table[((crc ^ (*b as u32)) & 0xff) as usize] ^ (crc >> 8);
    }
    crc ^ 0xffffffff
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