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
fn skills_test_default() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let skills_file = tmp_dir.path().join("skills").join("skills.md");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-skills")
        .assert()
        .success();

    assert!(skills_file.exists());

    let content = std::fs::read_to_string(skills_file).expect("Unable to read skills.md");
    assert!(content.contains("# Selenium Skills & Best Practices"));
}

#[test]
fn skills_test_fallback() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let skills_dir = tmp_dir.path().join("skills");
    std::fs::create_dir_all(&skills_dir).expect("Unable to create directory");
    let default_skills_file = skills_dir.join("skills.md");
    std::fs::write(&default_skills_file, "Original").expect("Unable to write file");
    let fallback_file = tmp_dir.path().join("selenium.md");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-skills")
        .assert()
        .success();

    assert!(fallback_file.exists());
    let content = std::fs::read_to_string(fallback_file).expect("Unable to read selenium.md");
    assert!(content.contains("# Selenium Skills & Best Practices"));
}

#[test]
fn skills_test_custom_name() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let custom_file = tmp_dir.path().join("my-skills.txt");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-skills")
        .arg("my-skills.txt")
        .assert()
        .success();

    assert!(custom_file.exists());
    let content = std::fs::read_to_string(custom_file).expect("Unable to read file");
    assert!(content.contains("# Selenium Skills & Best Practices"));
}

#[test]
fn skills_no_overwrite_test() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let skills_dir = tmp_dir.path().join("skills");
    std::fs::create_dir_all(&skills_dir).expect("Unable to create directory");
    let skills_file = skills_dir.join("skills.md");
    std::fs::write(&skills_file, "Original content").expect("Unable to write file");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-skills")
        .assert()
        .success();

    // It should NOT overwrite skills/skills.md, but instead fallback to selenium.md
    let content = std::fs::read_to_string(&skills_file).expect("Unable to read skills.md");
    assert_eq!(content, "Original content");

    let fallback_file = tmp_dir.path().join("selenium.md");
    assert!(fallback_file.exists());
}

#[test]
fn skills_custom_no_overwrite_test() {
    let tmp_dir = tempdir().expect("Unable to create temp directory");
    let custom_file = tmp_dir.path().join("my-skills.md");
    std::fs::write(&custom_file, "Original content").expect("Unable to write file");

    let mut cmd = get_selenium_manager();
    cmd.current_dir(tmp_dir.path())
        .arg("--init-skills")
        .arg("my-skills.md")
        .assert()
        .failure();

    let content = std::fs::read_to_string(custom_file).expect("Unable to read file");
    assert_eq!(content, "Original content");
}
