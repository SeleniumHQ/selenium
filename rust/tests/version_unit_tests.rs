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
// software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied.  See the License
// for the specific language governing permissions and limitations
// under the License.

use selenium_manager::files::parse_version;
use selenium_manager::logger::Logger;
use selenium_manager::SeleniumManager;
use selenium_manager::get_manager_by_browser;

use rstest::rstest;

#[rstest]
#[case("Google Chrome 120.0.6099.109", "120.0.6099.109")]
#[case("Chromium 115.0.5790.110", "115.0.5790.110")]
#[case("Microsoft Edge 120.0.2210.91", "120.0.2210.91")]
#[case("Mozilla Firefox 121.0", "121.0")]
#[case("115", "115")]
#[case("  130.0.6723.91  ", "130.0.6723.91")]
fn parse_version_extracts_version_string(#[case] input: &str, #[case] expected: &str) {
    let log = Logger::new();
    let result = parse_version(input.to_string(), &log).unwrap();
    assert_eq!(result, expected);
}

#[test]
fn parse_version_strips_trailing_dot() {
    let log = Logger::new();
    let result = parse_version("120.".to_string(), &log).unwrap();
    assert_eq!(result, "120");
}

#[rstest]
#[case("error: command not found")]
#[case("ERROR: something went wrong")]
#[case("Error: unable to locate browser")]
fn parse_version_returns_error_on_error_string(#[case] input: &str) {
    let log = Logger::new();
    let result = parse_version(input.to_string(), &log);
    assert!(result.is_err());
}

#[test]
fn parse_version_returns_empty_on_garbage() {
    let log = Logger::new();
    let result = parse_version("no version here".to_string(), &log).unwrap();
    assert_eq!(result, "");
}

#[test]
fn parse_version_handles_esr_suffix() {
    let log = Logger::new();
    let result = parse_version("Mozilla Firefox 115.12.0esr".to_string(), &log).unwrap();
    assert_eq!(result, "115.12.0");
}

#[test]
fn parse_version_handles_snap_prefix() {
    let log = Logger::new();
    let result = parse_version("snap 121.0.1".to_string(), &log).unwrap();
    assert_eq!(result, "121.0.1");
}

#[rstest]
#[case("stable", true)]
#[case("STABLE", true)]
#[case("Stable", true)]
#[case("beta", false)]
#[case("120.0.6099.109", false)]
fn is_stable_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.is_stable(version), expected);
}

#[rstest]
#[case("beta", true)]
#[case("BETA", true)]
#[case("Beta", true)]
#[case("stable", false)]
#[case("120.0", false)]
fn is_beta_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.is_beta(version), expected);
}

#[rstest]
#[case("dev", true)]
#[case("DEV", true)]
#[case("Dev", true)]
#[case("stable", false)]
fn is_dev_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.is_dev(version), expected);
}

#[rstest]
#[case("nightly", true)]
#[case("NIGHTLY", true)]
#[case("canary", true)]
#[case("CANARY", true)]
#[case("Canary", true)]
#[case("stable", false)]
#[case("120.0", false)]
fn is_nightly_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.is_nightly(version), expected);
}

#[rstest]
#[case("esr", true)]
#[case("ESR", true)]
#[case("Esr", true)]
#[case("stable", false)]
#[case("115.12.0", false)]
fn is_esr_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("firefox".to_string()).unwrap();
    assert_eq!(manager.is_esr(version), expected);
}

#[rstest]
#[case("120.0.6099.109", true)]
#[case("121.0", true)]
#[case("stable", false)]
#[case("beta", false)]
#[case("", false)]
fn is_version_specific_predicate(#[case] version: &str, #[case] expected: bool) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.is_version_specific(version), expected);
}

#[rstest]
#[case("120.0.6099.109", "120")]
#[case("115", "115")]
#[case("130.0.6723.91", "130")]
fn get_major_version_extracts_major(#[case] version: &str, #[case] expected: &str) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    let result = manager.get_major_version(version).unwrap();
    assert_eq!(result, expected);
}

#[test]
fn get_major_version_errors_on_empty() {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    let result = manager.get_major_version("");
    assert!(result.is_err());
}

#[test]
fn get_major_version_errors_on_garbage() {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    let result = manager.get_major_version("not-a-version");
    assert_eq!(result.unwrap(), "not-a-version");
}

#[rstest]
#[case("stable", "stable")]
#[case("beta", "beta")]
#[case("dev", "dev")]
#[case("nightly", "nightly")]
#[case("canary", "canary")]
#[case("esr", "esr")]
#[case("120.0.6099.109", "120")]
#[case("115", "115")]
fn get_major_browser_version_returns_expected(#[case] version: &str, #[case] expected: &str) {
    let mut manager = get_manager_by_browser("chrome".to_string()).unwrap();
    manager.set_browser_version(version.to_string());
    assert_eq!(manager.get_major_browser_version(), expected);
}

#[test]
fn get_major_browser_version_empty_returns_empty() {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    assert_eq!(manager.get_major_browser_version(), "");
}
