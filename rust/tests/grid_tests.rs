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
use selenium_manager::SeleniumManager;
use selenium_manager::grid::GridManager;
use selenium_manager::logger::JsonOutput;
use selenium_manager::{NIGHTLY, SNAPSHOT};
use std::fs;
use std::path::Path;
use std::str;
use tempfile::tempdir;

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
#[case("nightly")]
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
    let version_label = if grid_version.eq_ignore_ascii_case(NIGHTLY) {
        SNAPSHOT
    } else {
        grid_version
    };
    assert!(jar_name.contains(version_label));
}

#[test]
fn grid_without_java_test() {
    let mut cmd = get_selenium_manager();
    cmd.env("PATH", "")
        .env_remove("JAVA_HOME")
        .args(["--grid", "--output", "json"])
        .assert()
        .success()
        .code(0);

    let stdout = get_stdout(&mut cmd);
    let json: JsonOutput = serde_json::from_str(&stdout).unwrap();
    assert!(Path::new(&json.result.driver_path).exists());
    assert!(json.logs.iter().all(|log| !log.message.contains("Java")));
}

#[rstest]
#[case("bad-version")]
#[case("99.99.99")]
fn grid_error_test(#[case] grid_version: &str) {
    let mut cmd = get_selenium_manager();
    let result = cmd.args(["--grid", grid_version]).assert().try_success();

    assert_output(&mut cmd, result, vec!["There was an error"], DATAERR);
}

#[test]
fn grid_cache_fallback_finds_cached_jar_test() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    let version = "4.54.0";
    let jar_dir = cache.join("grid").join(version);
    fs::create_dir_all(&jar_dir).unwrap();
    fs::write(
        jar_dir.join(format!("selenium-server-{version}.jar")),
        b"fake jar",
    )
    .unwrap();

    let mut manager = GridManager::new(version.to_string()).unwrap();
    manager.set_cache_path(cache.to_str().unwrap().to_string());

    let found = manager.find_best_driver_from_cache().unwrap();
    assert!(found.is_some(), "the cached Grid jar was not found");
    assert!(
        found
            .unwrap()
            .to_str()
            .unwrap()
            .contains("selenium-server-4.54.0.jar"),
        "the cache lookup returned a different file"
    );
}

#[test]
fn grid_cache_fallback_ignores_other_files_test() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    let grid_dir = cache.join("grid").join("4.54.0");
    fs::create_dir_all(&grid_dir).unwrap();
    // The shared matcher looks for the driver name and the binary extension.
    // Neither file below is the Grid artifact, so the fallback must skip both.
    fs::write(grid_dir.join("selenium-server"), b"not the jar").unwrap();
    fs::write(grid_dir.join("selenium-server.zip"), b"not the jar").unwrap();

    let mut manager = GridManager::new("4.54.0".to_string()).unwrap();
    manager.set_cache_path(cache.to_str().unwrap().to_string());

    let found = manager.find_best_driver_from_cache().unwrap();
    assert!(
        found.is_none(),
        "the cache lookup returned a file that is not a Grid jar"
    );
}
