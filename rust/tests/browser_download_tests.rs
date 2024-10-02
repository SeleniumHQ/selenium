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

use crate::common::{assert_browser, assert_driver, get_selenium_manager};

use rstest::rstest;
use std::env::consts::OS;

mod common;

#[rstest]
#[case("chrome")]
#[case("firefox")]
#[case("edge")]
fn browser_latest_download_test(#[case] browser: String) {
    if !browser.eq("edge") || !OS.eq("windows") {
        let mut cmd = get_selenium_manager();
        cmd.args([
            "--browser",
            &browser,
            "--force-browser-download",
            "--output",
            "json",
            "--debug",
        ])
        .assert()
        .success()
        .code(0);

        assert_driver(&mut cmd);
        assert_browser(&mut cmd);
    }
}

#[rstest]
#[case("chrome", "113")]
#[case("chrome", "beta")]
#[case("firefox", "116")]
#[case("firefox", "beta")]
#[case("firefox", "esr")]
#[case("edge", "beta")]
fn browser_version_download_test(#[case] browser: String, #[case] browser_version: String) {
    if OS.eq("windows") && browser.eq("edge") {
        println!("Skipping Edge download test on Windows since the installation requires admin privileges");
    } else {
        let mut cmd = get_selenium_manager();
        cmd.args([
            "--browser",
            &browser,
            "--browser-version",
            &browser_version,
            "--output",
            "json",
            "--debug",
        ])
        .assert()
        .success()
        .code(0);

        assert_driver(&mut cmd);
        assert_browser(&mut cmd);
    }
}
