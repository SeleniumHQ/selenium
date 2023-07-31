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

use crate::common::assert_driver_and_browser;
use rstest::rstest;

mod common;

#[test]
fn chrome_latest_download_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args([
        "--browser",
        "chrome",
        "--force-browser-download",
        "--output",
        "json",
    ])
    .assert()
    .success()
    .code(0);

    assert_driver_and_browser(&mut cmd);
}

#[rstest]
#[case("113")]
#[case("beta")]
fn chrome_version_download_test(#[case] browser_version: String) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args([
        "--browser",
        "chrome",
        "--browser-version",
        &browser_version,
        "--output",
        "json",
    ])
    .assert()
    .success()
    .code(0);

    assert_driver_and_browser(&mut cmd);
}
