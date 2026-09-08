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

use selenium_manager::config::ARCH::{ARM64, ARMV7, X32, X64};
use selenium_manager::config::OS::{LINUX, MACOS, WINDOWS};
use selenium_manager::config::{ARCH, OS, str_to_os};

use rstest::rstest;

#[rstest]
#[case("windows", WINDOWS)]
#[case("win", WINDOWS)]
#[case("Windows", WINDOWS)]
#[case("WINDOWS", WINDOWS)]
#[case("macos", MACOS)]
#[case("mac", MACOS)]
#[case("MacOS", MACOS)]
#[case("linux", LINUX)]
#[case("gnu/linux", LINUX)]
#[case("Linux", LINUX)]
fn str_to_os_parses_valid_os(#[case] input: &str, #[case] expected: OS) {
    let result = str_to_os(input).unwrap();
    assert_eq!(result, expected);
}

#[rstest]
#[case("solaris")]
#[case("")]
#[case("darwin")]
#[case("unix")]
fn str_to_os_rejects_invalid_os(#[case] input: &str) {
    let result = str_to_os(input);
    assert!(result.is_err());
}

#[rstest]
#[case(WINDOWS, "windows")]
#[case(WINDOWS, "win")]
#[case(WINDOWS, "Windows")]
#[case(MACOS, "macos")]
#[case(MACOS, "mac")]
#[case(LINUX, "linux")]
#[case(LINUX, "gnu/linux")]
fn os_is_matches(#[case] os: OS, #[case] candidate: &str) {
    assert!(os.is(candidate));
}

#[rstest]
#[case(WINDOWS, "linux")]
#[case(WINDOWS, "macos")]
#[case(MACOS, "windows")]
#[case(MACOS, "linux")]
#[case(LINUX, "windows")]
#[case(LINUX, "macos")]
fn os_is_does_not_match(#[case] os: OS, #[case] candidate: &str) {
    assert!(!os.is(candidate));
}

#[rstest]
#[case(X32, "x86")]
#[case(X32, "i386")]
#[case(X32, "x32")]
#[case(X32, "i686")]
#[case(X64, "x86_64")]
#[case(X64, "amd64")]
#[case(X64, "x64")]
#[case(X64, "ia64")]
#[case(ARM64, "arm64")]
#[case(ARM64, "aarch64")]
#[case(ARM64, "arm")]
#[case(ARMV7, "arm7l")]
#[case(ARMV7, "armv7l")]
fn arch_is_matches(#[case] arch: ARCH, #[case] candidate: &str) {
    assert!(arch.is(candidate));
}

#[rstest]
#[case(X32, "x86_64")]
#[case(X32, "arm64")]
#[case(X64, "x86")]
#[case(X64, "i686")]
#[case(X64, "arm7l")]
#[case(ARM64, "x86_64")]
#[case(ARMV7, "aarch64")]
fn arch_is_does_not_match(#[case] arch: ARCH, #[case] candidate: &str) {
    assert!(!arch.is(candidate));
}
