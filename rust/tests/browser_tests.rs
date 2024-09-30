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
use std::env::consts::OS;

mod common;

#[rstest]
#[case("chrome", "chromedriver", "114", "114.0.5735.90")]
#[case("chrome", "chromedriver", "115", "115.0.5790")]
#[case("edge", "msedgedriver", "105", "105.0")]
#[case("edge", "msedgedriver", "106", "106.0")]
#[case("firefox", "geckodriver", "101", "0.31.0")]
#[case("firefox", "geckodriver", "91", "0.31.0")]
#[case("firefox", "geckodriver", "90", "0.30.0")]
#[case("firefox", "geckodriver", "62", "0.29.1")]
#[case("firefox", "geckodriver", "53", "0.18.0")]
fn browser_version_test(
    #[case] browser: String,
    #[case] driver_name: String,
    #[case] browser_version: String,
    #[case] driver_version: String,
) {
    let mut cmd = get_selenium_manager();
    cmd.args([
        "--browser",
        &browser,
        "--browser-version",
        &browser_version,
        "--debug",
        "--avoid-browser-download",
        "--language-binding",
        "java",
    ])
    .assert()
    .success()
    .code(0);

    let stdout = get_stdout(&mut cmd);

    assert!(stdout.contains(&driver_name));
    if !browser_version.is_empty() && stdout.contains("cache") {
        assert!(stdout.contains(&driver_version));
    }
    assert!(!stdout.contains("Error sending stats"));
}

#[rstest]
#[case("wrong-browser", "", "", DATAERR)]
#[case("chrome", "wrong-browser-version", "", DATAERR)]
#[case("chrome", "", "wrong-driver-version", DATAERR)]
#[case("firefox", "", "wrong-driver-version", DATAERR)]
#[case("edge", "wrong-browser-version", "", DATAERR)]
#[case("edge", "", "wrong-driver-version", DATAERR)]
#[case("iexplorer", "", "wrong-driver-version", DATAERR)]
fn wrong_parameters_test(
    #[case] browser: String,
    #[case] browser_version: String,
    #[case] driver_version: String,
    #[case] error_code: i32,
) {
    let mut cmd = get_selenium_manager();
    let result = cmd
        .args([
            "--debug",
            "--browser",
            &browser,
            "--browser-version",
            &browser_version,
            "--driver-version",
            &driver_version,
        ])
        .assert()
        .try_success();

    assert_output(&mut cmd, result, vec!["in PATH"], error_code);
}

#[test]
fn invalid_geckodriver_version_test() {
    let mut cmd = get_selenium_manager();
    let result = cmd
        .args([
            "--browser",
            "firefox",
            "--browser-version",
            "51",
            "--avoid-browser-download",
        ])
        .assert()
        .try_success();

    assert_output(
        &mut cmd,
        result,
        vec!["Not valid geckodriver version found"],
        DATAERR,
    );
}

#[rstest]
#[case(
    "windows",
    "chrome",
    r"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
)]
#[case(
    "windows",
    "chrome",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe"
)]
#[case("linux", "chrome", "/usr/bin/google-chrome")]
#[case(
    "macos",
    "chrome",
    r"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
)]
fn browser_path_test(#[case] os: String, #[case] browser: String, #[case] browser_path: String) {
    if OS.eq(&os) {
        let mut cmd = get_selenium_manager();
        cmd.args(["--browser", &browser, "--browser-path", &browser_path])
            .assert()
            .success()
            .code(0);

        let stdout = get_stdout(&mut cmd);

        assert!(!stdout.contains("WARN"));
    }
}

#[test]
fn invalid_browser_path_test() {
    let mut cmd = get_selenium_manager();
    cmd.args([
        "--browser",
        "chrome",
        "--browser-path",
        "/bad/path/google-chrome-wrong",
    ])
    .assert()
    .code(DATAERR)
    .failure();
}
