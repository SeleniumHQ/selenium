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

use assert_cmd::assert::AssertResult;
use assert_cmd::Command;
use is_executable::is_executable;
use selenium_manager::files::path_to_string;
use selenium_manager::logger::JsonOutput;
use selenium_manager::shell;
use selenium_manager::shell::run_shell_command_by_os;
use std::borrow::BorrowMut;
use std::env::consts::OS;
use std::path::Path;

#[allow(dead_code)]
pub fn get_selenium_manager() -> Command {
    Command::new(env!("CARGO_BIN_EXE_selenium-manager"))
}

#[allow(dead_code)]
pub fn assert_driver(cmd: &mut Command) {
    let stdout = get_stdout(cmd);

    let json: JsonOutput = serde_json::from_str(&stdout).unwrap();
    let driver_path = Path::new(&json.result.driver_path);
    assert!(driver_path.exists());
    assert!(is_executable(driver_path));
}

#[allow(dead_code)]
pub fn assert_browser(cmd: &mut Command) {
    let stdout = &cmd.unwrap().stdout;
    let output = std::str::from_utf8(stdout).unwrap();
    let json: JsonOutput = serde_json::from_str(output).unwrap();
    let browser_path = Path::new(&json.result.browser_path);
    assert!(browser_path.exists());
    assert!(is_executable(browser_path));
}

#[allow(dead_code)]
pub fn get_driver_path(cmd: &mut Command) -> String {
    let stdout = &cmd.unwrap().stdout;
    let output = std::str::from_utf8(stdout).unwrap();
    let json: JsonOutput = serde_json::from_str(output).unwrap();
    path_to_string(Path::new(&json.result.driver_path))
}

#[allow(dead_code)]
pub fn exec_driver(cmd: &mut Command) -> String {
    let cmd_mut = cmd.borrow_mut();
    let driver_path = get_driver_path(cmd_mut);
    let driver_version_command = shell::Command::new_single(format!("{} --version", &driver_path));
    let output = run_shell_command_by_os(OS, driver_version_command).unwrap();
    println!("**** EXEC DRIVER: {}", output);
    output
}

#[allow(dead_code)]
pub fn get_stdout(cmd: &mut Command) -> String {
    let stdout = &cmd.unwrap().stdout;
    let output = std::str::from_utf8(stdout).unwrap();
    println!("{}", output);
    output.to_string()
}

#[allow(dead_code)]
pub fn get_stderr(cmd: &mut Command) -> String {
    let stderr = &cmd.unwrap().stderr;
    let err_output = std::str::from_utf8(stderr).unwrap();
    println!("stderr: {}", err_output);
    err_output.to_string()
}

#[allow(dead_code)]
pub fn assert_output(
    cmd: &mut Command,
    assert_result: AssertResult,
    expected_output: Vec<&str>,
    error_code: i32,
) {
    if assert_result.is_ok() {
        let stdout = &cmd.unwrap().stdout;
        let output = std::str::from_utf8(stdout).unwrap();
        expected_output
            .iter()
            .for_each(|o| assert!(output.contains(o)));
    } else {
        assert!(assert_result
            .err()
            .unwrap()
            .to_string()
            .contains(&error_code.to_string()));
    }
}
