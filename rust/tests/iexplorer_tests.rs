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

use rstest::rstest;

#[rstest]
#[case("4.8.0")]
#[case("4.8.1")]
fn iexplorer_test(#[case] driver_version: String) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    let cmd_assert = cmd
        .args([
            "--browser",
            "iexplorer",
            "--driver-version",
            &driver_version,
        ])
        .assert();
    cmd_assert.success();
}

#[rstest]
#[case("iexplorer")]
#[case("ie")]
#[case("internetexplorer")]
#[case("internet explorer")]
#[case("internet-explorer")]
#[case("internet_explorer")]
fn ie_name_test(#[case] browser_name: String) {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    let cmd_assert = cmd.args(["--browser", &browser_name]).assert();
    cmd_assert.success();
}
