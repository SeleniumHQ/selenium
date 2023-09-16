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

use crate::common::get_driver_path;
use assert_cmd::Command;
use std::fs;
use std::path::Path;

mod common;

#[test]
fn cache_path_test() {
    let mut cmd = Command::new(env!("CARGO_BIN_EXE_selenium-manager"));
    let tmp_cache_folder_name = "../tmp";
    cmd.args([
        "--browser",
        "chrome",
        "--cache-path",
        tmp_cache_folder_name,
        "--output",
        "json",
    ])
    .assert()
    .success()
    .code(0);

    let driver_path = get_driver_path(&mut cmd);
    println!("*** Custom cache path: {}", driver_path);
    assert!(!driver_path.contains(r#"cache\selenium"#));

    let tmp_cache_path = Path::new(tmp_cache_folder_name);
    fs::remove_dir_all(tmp_cache_path).unwrap();
    assert!(!tmp_cache_path.exists());
}
