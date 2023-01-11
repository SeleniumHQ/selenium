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

use assert_cmd::Command;
use std::path::Path;

use selenium_manager::logger::JsonOutput;
use std::str;

#[test]
fn json_output_test() {
    let mut cmd = Command::cargo_bin(env!("CARGO_PKG_NAME")).unwrap();
    cmd.args(["--browser", "chrome", "--output", "json"])
        .assert()
        .success()
        .code(0);

    let stdout = &cmd.unwrap().stdout;
    let output = str::from_utf8(stdout).unwrap();
    println!("{}", output);

    let json: JsonOutput = serde_json::from_str(output).unwrap();
    assert!(!json.logs.is_empty());
}

#[test]
fn shell_output_test() {
    let mut cmd = Command::cargo_bin(env!("CARGO_PKG_NAME")).unwrap();
    cmd.args(["--browser", "chrome", "--output", "shell"])
        .assert()
        .success()
        .code(0);

    let stdout = &cmd.unwrap().stdout;
    let output = str::from_utf8(stdout).unwrap();
    println!("{}", output);

    let path = Path::new(strip_trailing_newline(output));
    assert!(path.exists());
}

fn strip_trailing_newline(input: &str) -> &str {
    input
        .strip_suffix("\r\n")
        .or_else(|| input.strip_suffix('\n'))
        .unwrap_or(input)
}
