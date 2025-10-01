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

use crate::common::{get_selenium_manager, get_stdout};

mod common;

#[test]
fn offline_test() {
    let mut cmd = get_selenium_manager();
    cmd.args(["--debug", "--browser", "chrome", "--offline"])
        .assert()
        .success()
        .code(0);

    let stdout = get_stdout(&mut cmd);

    assert!(stdout.contains("offline mode"));
}

#[test]
fn offline_json_output_includes_browser_path_test() {
    use serde_json::Value;

    let mut cmd = get_selenium_manager();
    cmd.args([
        "--debug",
        "--browser",
        "chrome",
        "--offline",
        "--output",
        "json"
    ])
    .assert()
    .success()
    .code(0);

    let stdout = get_stdout(&mut cmd);

    let json: Value = serde_json::from_str(&stdout)
        .expect("Should be valid JSON");

    assert!(json["result"].is_object(), "Result should be an object");
    assert!(json["result"]["code"].is_number(), "Code should be a number");
    assert_eq!(json["result"]["code"], 0, "Code should be 0 for success");

    assert!(json["result"]["browser_path"].is_string(), "browser_path should be a string");

    assert!(json["logs"].is_array(), "Logs should be an array");
    let logs_str = json["logs"].to_string();
    assert!(logs_str.contains("offline mode"), "Should mention offline mode in logs");
}
