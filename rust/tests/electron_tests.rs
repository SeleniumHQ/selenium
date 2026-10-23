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

use crate::common::{get_driver_path, get_selenium_manager};

use rstest::rstest;

mod common;

#[test]
fn electron_latest_test() {
    let mut cmd = get_selenium_manager();
    let cmd_assert = cmd.args(["--browser", "electron"]).assert();
    cmd_assert.success();
}

#[rstest]
#[case("36.2.1")]
fn electron_version_test(#[case] driver_version: String) {
    let mut cmd = get_selenium_manager();
    let cmd_assert = cmd
        .args(["--browser", "electron", "--driver-version", &driver_version])
        .assert();
    cmd_assert.success();
}

#[rstest]
#[case("36.2.1")]
#[case("v36.2.1")]
fn electron_browser_version_test(#[case] browser_version: String) {
    // Regression for issue #17549: when the user pins --browser-version, the
    // resolved driver version must be derived from the requested version, not
    // from the /releases/latest redirect. Asserting that the resolved driver
    // path contains the requested version protects against silently falling
    // back to the latest tag.
    //
    // The `v36.2.1` case additionally guards against a doubled `v` prefix:
    // `get_driver_url()` already prepends `v` to the driver version, so the
    // pinned version must be normalized (leading `v` stripped) before being
    // returned.
    let mut cmd = get_selenium_manager();
    cmd.args([
        "--browser",
        "electron",
        "--browser-version",
        &browser_version,
        "--output",
        "json",
    ]);
    let driver_path = get_driver_path(&mut cmd);
    let expected = browser_version.trim_start_matches(['v', 'V']);
    assert!(
        driver_path.contains(expected),
        "expected resolved driver path to contain requested version {}, got: {}",
        expected,
        driver_path
    );
    assert!(
        !driver_path.contains("vv"),
        "resolved driver path must not contain doubled `v` prefix, got: {}",
        driver_path
    );
}

#[test]
fn electron_major_only_browser_version_falls_back_test() {
    // Regression: a major-only --browser-version like `36` is not a valid
    // Electron release tag (no `v36` exists), so the manager must fall back
    // to the /releases/latest redirect instead of constructing a 404 URL.
    // We assert the command still succeeds; the resolved driver version is
    // whatever `/releases/latest` currently points at, which we do not pin.
    let mut cmd = get_selenium_manager();
    let cmd_assert = cmd
        .args(["--browser", "electron", "--browser-version", "36"])
        .assert();
    cmd_assert.success();
}
