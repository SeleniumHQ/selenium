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

use crate::common::{assert_output, get_selenium_manager, get_stdout};

use exitcode::DATAERR;
use rstest::rstest;
use selenium_manager::logger::JsonOutput;
use std::path::Path;
use std::str;

mod common;

#[test]
fn grid_latest_test() {
    let mut cmd = get_selenium_manager();
    cmd.args(["--grid", "--output", "json"])
        .assert()
        .success()
        .code(0);

    let stdout = get_stdout(&mut cmd);
    let json: JsonOutput = serde_json::from_str(&stdout).unwrap();
    assert!(!json.logs.is_empty());

    let output_code = json.result.code;
    assert_eq!(output_code, 0);

    let jar = Path::new(&json.result.driver_path);
    assert!(jar.exists());

    let jar_name = jar.file_name().unwrap().to_str().unwrap();
    assert!(jar_name.contains("selenium-server"));
}

#[rstest]
#[case("4.8.0")]
#[case("4.9.0")]
#[case("4.10.0")]
fn grid_version_test(#[case] grid_version: &str) {
    let mut cmd = get_selenium_manager();
    cmd.args(["--grid", grid_version, "--output", "json"])
        .assert()
        .success()
        .code(0);

    let stdout = get_stdout(&mut cmd);

    let json: JsonOutput = serde_json::from_str(&stdout).unwrap();
    let jar = Path::new(&json.result.driver_path);
    let jar_name = jar.file_name().unwrap().to_str().unwrap();
    assert!(jar_name.contains(grid_version));
}

#[rstest]
#[case("bad-version")]
#[case("99.99.99")]
fn grid_error_test(#[case] grid_version: &str) {
    let mut cmd = get_selenium_manager();
    let result = cmd.args(["--grid", grid_version]).assert().try_success();

    assert_output(&mut cmd, result, vec!["There was an error"], DATAERR);
}
