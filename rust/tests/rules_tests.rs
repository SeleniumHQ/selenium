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

use tempfile::tempdir;

mod common;
use common::get_selenium_manager;

#[test]
fn rules_test_default() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let rules_file = tmp_dir.path().join("rules").join("selenium.md");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-rules")
        .assert()
        .success();

    assert!(rules_file.exists());

    let content = std::fs::read_to_string(rules_file).expect("Unable to read selenium.md");
    assert!(content.contains("# Selenium Rules for AI Assistants"));
}

#[test]
fn rules_test_fallback() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let rules_dir = tmp_dir.path().join("rules");
    std::fs::create_dir_all(&rules_dir).expect("Unable to create directory");
    let default_rules_file = rules_dir.join("selenium.md");
    std::fs::write(&default_rules_file, "Original").expect("Unable to write file");
    let fallback_file = tmp_dir.path().join("selenium-rules.md");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-rules")
        .assert()
        .success();

    assert!(fallback_file.exists());
    let content = std::fs::read_to_string(fallback_file).expect("Unable to read selenium-rules.md");
    assert!(content.contains("# Selenium Rules for AI Assistants"));
}

#[test]
fn rules_test_custom_name() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let custom_file = tmp_dir.path().join("my-rules.md");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-rules")
        .arg("my-rules.md")
        .assert()
        .success();

    assert!(custom_file.exists());
    let content = std::fs::read_to_string(custom_file).expect("Unable to read file");
    assert!(content.contains("# Selenium Rules for AI Assistants"));
}

#[test]
fn rules_no_overwrite_test() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let rules_dir = tmp_dir.path().join("rules");
    std::fs::create_dir_all(&rules_dir).expect("Unable to create directory");
    let rules_file = rules_dir.join("selenium.md");
    std::fs::write(&rules_file, "Original content").expect("Unable to write file");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-rules")
        .assert()
        .success();

    // It should NOT overwrite rules/selenium.md, but instead fallback to selenium-rules.md
    let content = std::fs::read_to_string(&rules_file).expect("Unable to read selenium.md");
    assert_eq!(content, "Original content");

    let fallback_file = tmp_dir.path().join("selenium-rules.md");
    assert!(fallback_file.exists());
}

#[test]
fn rules_custom_no_overwrite_test() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let custom_file = tmp_dir.path().join("my-rules.md");
    std::fs::write(&custom_file, "Original content").expect("Unable to write file");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-rules")
        .arg("my-rules.md")
        .assert()
        .failure();

    let content = std::fs::read_to_string(custom_file).expect("Unable to read file");
    assert_eq!(content, "Original content");
}
