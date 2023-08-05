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
use std::error::Error;
use std::process::Command;

pub const CRLF: &str = "\r\n";
pub const LF: &str = "\n";

pub fn run_shell_command_with_log(
    log: &Logger,
    os: &str,
    args: Vec<&str>,
) -> Result<String, Box<dyn Error>> {
    log.debug(format!("Running command: {:?}", args));
    let output = run_shell_command_by_os(os, args)?;
    log.debug(format!("Output: {:?}", output));
    Ok(output)
}

pub fn run_shell_command_by_os(os: &str, args: Vec<&str>) -> Result<String, Box<dyn Error>> {
    let (shell, flag) = if WINDOWS.is(os) {
        ("cmd", "/c")
    } else {
        ("sh", "-c")
    };
    run_shell_command(shell, flag, args)
}

pub fn run_shell_command(
    shell: &str,
    flag: &str,
    args: Vec<&str>,
) -> Result<String, Box<dyn Error>> {
    let mut command = Command::new(shell);
    command.arg(flag);
    for arg in args.iter() {
        command.arg(arg);
    }
    let output = command.output()?;
    Ok(
        strip_trailing_newline(String::from_utf8_lossy(&output.stdout).to_string().as_str())
            .to_string(),
    )
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
