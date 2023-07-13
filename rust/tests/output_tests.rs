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

use selenium_manager::logger::{JsonOutput, DRIVER_PATH};
use std::str;

#[test]
fn json_output_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args(["--browser", "chrome", "--output", "json"])
        .assert()
        .success()
        .code(0);

    let stdout = &cmd.unwrap().stdout;
    let output = str::from_utf8(stdout).unwrap();
    println!("{}", output);

    let json: JsonOutput = serde_json::from_str(output).unwrap();
    assert!(!json.logs.is_empty());

    let output_code = json.result.code;
    assert_eq!(output_code, 0);

    let driver = Path::new(&json.result.message);
    assert!(driver.exists());
}

#[test]
fn shell_output_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args(["--browser", "chrome", "--output", "shell"])
        .assert()
        .success()
        .code(0);

    let stdout = &cmd.unwrap().stdout;
    let output = str::from_utf8(stdout).unwrap();
    println!("{}", output);
    assert!(output.contains(DRIVER_PATH));
}
