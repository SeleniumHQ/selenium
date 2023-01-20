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

use crate::config::OS::{LINUX, MACOS, WINDOWS};
use std::env::consts::{ARCH, OS};

pub struct ManagerConfig {
    pub browser_version: String,
    pub driver_version: String,
    pub os: String,
    pub arch: String,
    pub browser_path: String,
}

impl ManagerConfig {
    pub fn default() -> ManagerConfig {
        ManagerConfig {
            browser_version: "".to_string(),
            driver_version: "".to_string(),
            os: OS.to_string(),
            arch: ARCH.to_string(),
            browser_path: "".to_string(),
        }
    }

    #[allow(clippy::should_implement_trait)]
    pub fn clone(config: &ManagerConfig) -> ManagerConfig {
        ManagerConfig {
            browser_version: config.browser_version.as_str().to_string(),
            driver_version: config.driver_version.as_str().to_string(),
            os: config.os.as_str().to_string(),
            arch: config.arch.as_str().to_string(),
            browser_path: config.browser_path.as_str().to_string(),
        }
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
#[derive(Hash, Eq, PartialEq, Debug)]
pub enum OS {
    WINDOWS,
    MACOS,
    LINUX,
}

impl OS {
    pub fn to_str(&self) -> &str {
        match self {
            WINDOWS => "windows",
            MACOS => "macos",
            LINUX => "linux",
        }
    }

    pub fn is(&self, os: &str) -> bool {
        self.to_str().eq_ignore_ascii_case(os)
    }
}

pub fn str_to_os(os: &str) -> OS {
    if WINDOWS.is(os) {
        WINDOWS
    } else if MACOS.is(os) {
        MACOS
    } else {
        LINUX
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
pub enum ARCH {
    X32,
    X64,
    ARM64,
}

impl ARCH {
    pub fn to_str(&self) -> &str {
        match self {
            ARCH::X32 => "x86",
            ARCH::X64 => "x86_64",
            ARCH::ARM64 => "aarch64",
        }
    }

    pub fn is(&self, arch: &str) -> bool {
        self.to_str().eq_ignore_ascii_case(arch)
    }
}
