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

use crate::common::{assert_browser, assert_driver, get_selenium_manager, get_stdout};

use rstest::rstest;

use std::fs::File;
use std::io::{BufWriter, Write};
use tempfile::Builder;

mod common;

#[rstest]
#[case("chrome")]
#[case("firefox")]
#[case("edge")]
fn config_test(#[case] browser_name: String) {
    let tmp_dir = Builder::new().prefix("sm-config-test").tempdir().unwrap();
    let config_path = tmp_dir.path().join("se-config.toml");
    let config_file = File::create(config_path.as_path()).unwrap();
    let mut writer = BufWriter::new(config_file);
    writer
        .write_all(format!(r#"browser="{}""#, browser_name).as_bytes())
        .unwrap();
    writer.flush().unwrap();

    let mut cmd = get_selenium_manager();
    cmd.args([
        "--output",
        "json",
        "--debug",
        "--cache-path",
        tmp_dir.path().to_str().unwrap(),
    ])
    .assert()
    .success()
    .code(0);

    let stdout = get_stdout(&mut cmd);

    assert!(!stdout.contains("WARN") && !stdout.contains("ERROR"));
    assert_driver(&mut cmd);
    assert_browser(&mut cmd);
}
