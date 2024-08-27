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

use crate::config::{BooleanKey, StringKey};
use crate::metadata::now_unix_timestamp;

use env_logger::Target::{Stderr, Stdout};
use env_logger::DEFAULT_FILTER_ENV;
use log::LevelFilter::{Debug, Info, Trace};
use log::{Level, LevelFilter};
use serde::{Deserialize, Serialize};
use std::cell::RefCell;
use std::env;
use std::fmt::Display;
use std::str::FromStr;

pub const DRIVER_PATH: &str = "Driver path: ";
pub const BROWSER_PATH: &str = "Browser path: ";

#[derive(Default, PartialEq)]
enum OutputType {
    #[default]
    Logger,
    Json,
    Shell,
    Mixed,
}

#[derive(Default)]
pub struct Logger {
    debug: bool,
    trace: bool,
    output: OutputType,
    json: RefCell<JsonOutput>,
    minimal_json: RefCell<MinimalJson>,
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

#[derive(Default, Serialize, Deserialize)]
pub struct MinimalJson {
    pub driver_path: String,
    pub browser_path: String,
    pub error: String,
}

impl Logger {
    pub fn new() -> Self {
        let debug = BooleanKey("debug", false).get_value();
        let trace = BooleanKey("trace", false).get_value();
        let log_level = StringKey(vec!["log-level"], "").get_value();
        Logger::create("", debug, trace, &log_level)
    }

    pub fn create(output: &str, debug: bool, trace: bool, log_level: &str) -> Self {
        let output_type;
        if output.eq_ignore_ascii_case("json") {
            output_type = OutputType::Json;
        } else if output.eq_ignore_ascii_case("shell") {
            output_type = OutputType::Shell;
        } else if output.eq_ignore_ascii_case("mixed") {
            output_type = OutputType::Mixed;
        } else {
            output_type = OutputType::Logger;
        }
        match output_type {
            OutputType::Logger | OutputType::Mixed => {
                if env::var(DEFAULT_FILTER_ENV).unwrap_or_default().is_empty() {
                    let mut filter = if !log_level.is_empty() {
                        LevelFilter::from_str(log_level).unwrap_or(Info)
                    } else {
                        let mut filter = match debug {
                            true => Debug,
                            false => Info,
                        };
                        if trace {
                            filter = Trace;
                        }
                        filter
                    };
                    if trace {
                        filter = Trace
                    }
                    let target = if output_type == OutputType::Logger {
                        Stdout
                    } else {
                        Stderr
                    };
                    env_logger::Builder::new()
                        .filter_module(env!("CARGO_CRATE_NAME"), filter)
                        .target(target)
                        .format_target(false)
                        .format_timestamp_millis()
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
            minimal_json: RefCell::new(Default::default()),
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

    pub fn debug_or_warn<T: Display>(&self, message: T, is_debug: bool) {
        let level = if is_debug { Level::Debug } else { Level::Warn };
        self.logger(message.to_string(), level);
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
                        self.json.borrow_mut().result.driver_path =
                            self.clean_driver_path(&message);
                    } else if message.starts_with(BROWSER_PATH) {
                        self.json.borrow_mut().result.browser_path =
                            self.clean_browser_path(&message);
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
                if self.output == OutputType::Mixed && level == Level::Info || level <= Level::Error
                {
                    if message.starts_with(DRIVER_PATH) {
                        self.minimal_json.borrow_mut().driver_path =
                            self.clean_driver_path(&message);
                    } else if message.starts_with(BROWSER_PATH) {
                        self.minimal_json.borrow_mut().browser_path =
                            self.clean_browser_path(&message);
                    } else {
                        self.minimal_json.borrow_mut().error = message.clone();
                    }
                }
                log::log!(level, "{}", message);
            }
        }
    }

    fn clean_driver_path(&self, message: &str) -> String {
        message.replace(DRIVER_PATH, "")
    }

    fn clean_browser_path(&self, message: &str) -> String {
        message.replace(BROWSER_PATH, "")
    }

    fn create_json_log(&self, message: String, level: Level) -> Logs {
        Logs {
            level: level.to_string().to_uppercase(),
            timestamp: now_unix_timestamp(),
            message,
        }
    }

    fn get_json_blog<T>(&self, json_output: &T) -> String
    where
        T: Serialize,
    {
        serde_json::to_string_pretty(json_output).unwrap()
    }

    pub fn set_code(&self, code: i32) {
        self.json.borrow_mut().result.code = code;
    }

    pub fn flush(&self) {
        if self.output == OutputType::Json {
            print!("{}", self.get_json_blog(&self.json));
        } else if self.output == OutputType::Mixed {
            print!("{}", self.get_json_blog(&self.minimal_json));
        }
    }

    pub fn is_debug_enabled(&self) -> bool {
        self.debug || self.trace
    }
}
