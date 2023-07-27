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

#[rstest]
#[case("chrome")]
#[case("firefox")]
#[case("edge")]
fn stable_browser_test(#[case] browser_name: String) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    cmd.args([
        "--browser",
        &browser_name,
        "--browser-version",
        "stable",
        "--output",
        "json",
    ])
    .assert()
    .success()
    .code(0);

    assert_driver_and_browser(&mut cmd);
}
