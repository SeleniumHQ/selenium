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

use crate::{Logger, WINDOWS};
use anyhow::Error;

pub const CRLF: &str = "\r\n";
pub const LF: &str = "\n";

pub struct Command {
    pub single_arg: Option<String>,
    pub multiple_args: Option<Vec<&'static str>>,
}

impl Command {
    pub fn new_single(single_arg: String) -> Self {
        Command {
            single_arg: Some(single_arg),
            multiple_args: None,
        }
    }

    pub fn new_multiple(multiple_args: Vec<&'static str>) -> Self {
        Command {
            single_arg: None,
            multiple_args: Some(multiple_args),
        }
    }

    pub fn is_single(&self) -> bool {
        self.single_arg.is_some()
    }

    pub fn is_multiple(&self) -> bool {
        self.multiple_args.is_some()
    }

    pub fn display(&self) -> String {
        if self.is_single() {
            self.single_arg.clone().unwrap()
        } else {
            self.multiple_args
                .clone()
                .unwrap()
                .into_iter()
                .map(|c| c.to_string())
                .collect::<Vec<String>>()
                .join(" ")
        }
    }
}

pub fn run_shell_command_with_log(
    log: &Logger,
    os: &str,
    command: Command,
) -> Result<String, Error> {
    log.debug(format!("Running command: {}", command.display()));
    let output = run_shell_command_by_os(os, command)?;
    log.debug(format!("Output: {:?}", output));
    Ok(output)
}

pub fn run_shell_command_by_os(os: &str, command: Command) -> Result<String, Error> {
    let (shell, flag) = if WINDOWS.is(os) {
        ("cmd", "/c")
    } else {
        ("sh", "-c")
    };
    run_shell_command(shell, flag, command)
}

pub fn run_shell_command(shell: &str, flag: &str, command: Command) -> Result<String, Error> {
    let mut process = std::process::Command::new(shell);
    process.arg(flag);

    if command.is_single() {
        process.arg(command.single_arg.unwrap());
    } else {
        for arg in command.multiple_args.unwrap().iter() {
            process.arg(arg);
        }
    }
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
