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

use crate::common::{assert_browser, assert_driver, exec_driver, get_selenium_manager};

use rstest::rstest;
use std::env::consts::OS;

mod common;

#[rstest]
#[case("chrome", "ChromeDriver")]
#[case("edge", "Microsoft Edge WebDriver")]
#[case("firefox", "geckodriver")]
#[case("iexplorer", "IEDriverServer")]
fn exec_driver_test(#[case] browser_name: String, #[case] driver_name: String) {
    let mut cmd = get_selenium_manager();
    cmd.args(["--browser", &browser_name, "--output", "json"])
        .assert()
        .success()
        .code(0);

    if (browser_name.eq("iexplorer") && OS.eq("windows"))
        || (!browser_name.eq("iexplorer") && !OS.eq("windows"))
    {
        assert_driver(&mut cmd);
        assert_browser(&mut cmd);
        let output = exec_driver(&mut cmd);
        assert!(output.contains(&driver_name));
    }
}
