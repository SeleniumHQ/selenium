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

use crate::Logger;
use anyhow::Error;
use std::process::Command as ProcessCommand;

pub const CRLF: &str = "\r\n";
pub const LF: &str = "\n";

pub struct Command {
    pub program: String,
    pub args: Vec<String>,
}

impl Command {
    pub fn new(program: impl Into<String>, args: Vec<String>) -> Self {
        Command {
            program: program.into(),
            args,
        }
    }

    pub fn display(&self) -> String {
        std::iter::once(self.program.as_str())
            .chain(self.args.iter().map(String::as_str))
            .collect::<Vec<_>>()
            .join(" ")
    }
}

pub fn run_shell_command_with_log(log: &Logger, command: Command) -> Result<String, Error> {
    log.debug(format!("Running command: {}", command.display()));
    let output = run_shell_command(command)?;
    log.debug(format!("Output: {:?}", output));
    Ok(output)
}

pub fn run_shell_command(command: Command) -> Result<String, Error> {
    let mut process = ProcessCommand::new(command.program);
    process.args(command.args);
    let output = process.output()?;
    Ok(strip_trailing_newline(&String::from_utf8_lossy(&output.stdout)).to_string())
}

pub fn strip_trailing_newline(input: &str) -> &str {
    input
        .strip_suffix(CRLF)
        .or_else(|| input.strip_suffix(LF))
        .unwrap_or(input)
}

pub fn split_lines(string: &str) -> Vec<&str> {
    if string.contains(CRLF) {
        string.split(CRLF).collect()
    } else {
        string.split(LF).collect()
    }
}
