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
use exitcode::DATAERR;
use std::str;

#[tokio::test]
async fn wrong_proxy_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    let assert_result = cmd
        .args([
            "--debug",
            "--browser",
            "chrome",
            "--proxy",
            "http://localhost:12345",
            "--clear-cache",
        ])
        .assert()
        .try_success();
    if assert_result.is_ok() {
        let stdout = &cmd.unwrap().stdout;
        let output = str::from_utf8(stdout).unwrap();
        assert!(output.contains("in PATH"));
    } else {
        assert!(assert_result
            .err()
            .unwrap()
            .to_string()
            .contains(&DATAERR.to_string()));
    }
}

#[test]
fn wrong_protocol_proxy_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args(["--browser", "chrome", "--proxy", "wrong:://proxy"])
        .assert()
        .failure()
        .code(DATAERR);
}

#[test]
fn wrong_port_proxy_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args([
        "--browser",
        "chrome",
        "--proxy",
        "https:://localhost:1234567",
    ])
    .assert()
    .failure()
    .code(DATAERR);
}
