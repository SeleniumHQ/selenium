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

use crate::metadata::now_unix_timestamp;
use env_logger::fmt::Color;
use env_logger::Target::Stdout;
use env_logger::DEFAULT_FILTER_ENV;
use log::Level;
use log::LevelFilter::{Debug, Info, Trace};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::env;
use std::fmt::Display;
use std::io::Write;
use std::ops::Deref;
use Color::{Blue, Cyan, Green, Red, Yellow};

pub const DRIVER_PATH: &str = "Driver path: ";
pub const BROWSER_PATH: &str = "Browser path: ";

#[derive(Default)]
enum OutputType {
    #[default]
    Logger,
    Json,
    Shell,
}

#[derive(Default)]
pub struct Logger {
    debug: bool,
    trace: bool,
    output: OutputType,
    json: RefCell<JsonOutput>,
}

#[derive(Default, Serialize, Deserialize)]
pub struct Logs {
    pub level: String,
    pub timestamp: u64,
    pub message: String,
}

#[derive(Default, Serialize, Deserialize)]
pub struct Result {
    pub code: i32,
    pub message: String,
    pub driver_path: String,
    pub browser_path: String,
}

#[derive(Default, Serialize, Deserialize)]
pub struct JsonOutput {
    pub logs: Vec<Logs>,
    pub result: Result,
}

impl Logger {
    pub fn create(output: &str, debug: bool, trace: bool) -> Self {
        let output_type;
        if output.eq_ignore_ascii_case("json") {
            output_type = OutputType::Json;
        } else if output.eq_ignore_ascii_case("shell") {
            output_type = OutputType::Shell;
        } else {
            output_type = OutputType::Logger;
        }
        match output_type {
            OutputType::Logger => {
                if env::var(DEFAULT_FILTER_ENV).unwrap_or_default().is_empty() {
                    let mut filter = match debug {
                        true => Debug,
                        false => Info,
                    };
                    if trace {
                        filter = Trace
                    }
                    env_logger::Builder::new()
                        .filter_module(env!("CARGO_CRATE_NAME"), filter)
                        .target(Stdout)
                        .format(|buf, record| {
                            let mut level_style = buf.style();
                            match record.level() {
                                Level::Trace => level_style.set_color(Cyan),
                                Level::Debug => level_style.set_color(Blue),
                                Level::Info => level_style.set_color(Green),
                                Level::Warn => level_style.set_color(Yellow),
                                Level::Error => level_style.set_color(Red).set_bold(true),
                            };
                            writeln!(
                                buf,
                                "{}\t{}",
                                level_style.value(record.level()),
                                record.args()
                            )
                        })
                        .try_init()
                        .unwrap_or_default();
                } else {
                    env_logger::try_init().unwrap_or_default();
                }
            }
            _ => {
                env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
                    .try_init()
                    .unwrap_or_default();
            }
        }

        Logger {
            debug,
            trace,
            output: output_type,
            json: RefCell::new(JsonOutput {
                logs: Vec::new(),
                result: Result {
                    code: 0,
                    message: "".to_string(),
                    driver_path: "".to_string(),
                    browser_path: "".to_string(),
                },
            }),
        }
    }

    pub fn error<T: Display>(&self, message: T) {
        self.logger(message.to_string(), Level::Error);
    }

    pub fn warn<T: Display>(&self, message: T) {
        self.logger(message.to_string(), Level::Warn);
    }

    pub fn info<T: Display>(&self, message: T) {
        self.logger(message.to_string(), Level::Info);
    }

    pub fn debug<T: Display>(&self, message: T) {
        self.logger(message.to_string(), Level::Debug);
    }

    pub fn trace<T: Display>(&self, message: T) {
        self.logger(message.to_string(), Level::Trace);
    }

    fn logger(&self, message: String, level: Level) {
        match self.output {
            OutputType::Json => {
                let trace = level <= Level::Trace && self.trace;
                let debug = level <= Level::Debug && self.debug;
                let other = level <= Level::Info;
                if trace || debug || other {
                    self.json
                        .borrow_mut()
                        .logs
                        .push(self.create_json_log(message.to_string(), level));
                }
                if level == Level::Info || level <= Level::Error {
                    if message.starts_with(DRIVER_PATH) {
                        let driver_path = message.replace(DRIVER_PATH, "");
                        self.json.borrow_mut().result.driver_path = driver_path.to_owned();
                        self.json.borrow_mut().result.message = driver_path;
                    } else if message.starts_with(BROWSER_PATH) {
                        let browser_path = message.replace(BROWSER_PATH, "");
                        self.json.borrow_mut().result.browser_path = browser_path;
                    } else {
                        self.json.borrow_mut().result.message = message;
                    }
                }
            }
            OutputType::Shell => {
                if level == Level::Info {
                    println!("{}", message);
                } else if level == Level::Error {
                    eprintln!("{}", message);
                }
            }
            _ => {
                log::log!(level, "{}", message);
            }
        }
    }

    fn create_json_log(&self, message: String, level: Level) -> Logs {
        Logs {
            level: level.to_string().to_uppercase(),
            timestamp: now_unix_timestamp(),
            message,
        }
    }

    pub fn set_code(&self, code: i32) {
        self.json.borrow_mut().result.code = code;
    }

    pub fn flush(&self) {
        let json_output = &self.json.borrow();
        let json = json_output.deref();
        if !json.logs.is_empty() {
            print!("{}", serde_json::to_string_pretty(json.deref()).unwrap());
        }
    }
}
