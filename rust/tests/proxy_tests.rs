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

use exitcode::UNAVAILABLE;

use wiremock::MockServer;

#[tokio::test]
async fn ok_proxy_test() {
    let mock_server = MockServer::start().await;
    let mut cmd = Command::cargo_bin(env!("CARGO_PKG_NAME")).unwrap();
    cmd.args(["--browser", "chrome", "--proxy", &mock_server.uri()])
        .assert()
        .success()
        .code(0);
}

#[test]
fn wrong_protocol_proxy_test() {
    let mut cmd = Command::cargo_bin(env!("CARGO_PKG_NAME")).unwrap();
    cmd.args(["--browser", "chrome", "--proxy", "wrong:://proxy"])
        .assert()
        .failure()
        .code(UNAVAILABLE);
}

#[test]
fn wrong_port_proxy_test() {
    let mut cmd = Command::cargo_bin(env!("CARGO_PKG_NAME")).unwrap();
    cmd.args([
        "--browser",
        "chrome",
        "--proxy",
        "https:://localhost:1234567",
    ])
    .assert()
    .failure()
    .code(UNAVAILABLE);
}
