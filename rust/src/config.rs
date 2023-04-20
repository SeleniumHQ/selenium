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
use crate::files::get_cache_folder;
use crate::{format_one_arg, run_shell_command, REQUEST_TIMEOUT_SEC, UNAME_COMMAND};
use crate::{ARCH_AMD64, ARCH_ARM64, ARCH_X86, TTL_BROWSERS_SEC, TTL_DRIVERS_SEC, WMIC_COMMAND_OS};
use std::env;
use std::env::consts::OS;
use std::error::Error;
use std::fs::read_to_string;
use toml::Table;

pub const ARM64_ARCH: &str = "arm64";
pub const CONFIG_FILE: &str = "selenium-manager-config.toml";
pub const ENV_PREFIX: &str = "SE_";
pub const VERSION_PREFIX: &str = "-version";
pub const PATH_PREFIX: &str = "-path";

pub struct ManagerConfig {
    pub browser_version: Option<String>,
    pub driver_version: Option<String>,
    pub browser_path: Option<String>,
    pub proxy: Option<String>,
    pub os: String,
    pub arch: String,
    pub timeout: u64,
    pub browser_ttl: u64,
    pub driver_ttl: u64,
}

impl ManagerConfig {
    pub fn default(browser_name: &str, driver_name: &str) -> ManagerConfig {
        let self_os = OS;
        let self_arch = if WINDOWS.is(self_os) {
            if run_shell_command(self_os, WMIC_COMMAND_OS.to_string())
                .unwrap_or_default()
                .contains("32")
            {
                ARCH_X86.to_string()
            } else {
                ARCH_AMD64.to_string()
            }
        } else {
            let uname_a = format_one_arg(UNAME_COMMAND, "a");
            if run_shell_command(self_os, uname_a)
                .unwrap_or_default()
                .to_ascii_lowercase()
                .contains(ARCH_ARM64)
            {
                ARCH_ARM64.to_string()
            } else {
                let uname_m = format_one_arg(UNAME_COMMAND, "m");
                run_shell_command(self_os, uname_m).unwrap_or_default()
            }
        };

        let browser_version_label = concat(browser_name, VERSION_PREFIX);
        let driver_version_label = concat(driver_name, VERSION_PREFIX);
        let browser_path_label = concat(browser_name, PATH_PREFIX);

        ManagerConfig {
            proxy: string_keys(vec!["proxy"]),

            browser_version: string_keys(vec!["browser-version", browser_version_label.as_str()]),
            driver_version: string_keys(vec!["driver-version", driver_version_label.as_str()]),
            browser_path: string_keys(vec!["browser-path", browser_path_label.as_str()]),

            timeout: uint_key("timeout").unwrap_or(REQUEST_TIMEOUT_SEC),
            browser_ttl: uint_key("browser-ttl").unwrap_or(TTL_BROWSERS_SEC),
            driver_ttl: uint_key("driver-ttl").unwrap_or(TTL_DRIVERS_SEC),

            os: string_key("os").unwrap_or(self_os.to_string()),
            arch: string_key("arch").unwrap_or(self_arch),
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
    pub fn to_str_vector(&self) -> Vec<&str> {
        match self {
            ARCH::X32 => vec![ARCH_X86, "i386"],
            ARCH::X64 => vec![ARCH_AMD64, "x86_64", "x64", "i686", "ia64"],
            ARCH::ARM64 => vec![ARCH_ARM64, "aarch64", "arm"],
        }
    }

    pub fn is(&self, arch: &str) -> bool {
        self.to_str_vector()
            .contains(&arch.to_ascii_lowercase().as_str())
    }
}
//pub fn string_keys
pub fn string_keys(keys: Vec<&str>) -> Option<String> {
    keys.iter().find_map(|x| string_key(x))
}

pub fn string_key(key: &str) -> Option<String> {
    match get_config() {
        Ok(config) => {
            let res = config
                .get(key)
                .and_then(|x| x.as_str())
                .map(|x| x.to_string());
            if res.is_some() {
                return res;
            }
            env::var(get_env_name(key)).ok()
        }
        Err(_) => None, // TODO log errors
    }
}

pub fn uint_key(key: &str) -> Option<u64> {
    match get_config() {
        Ok(config) => {
            let res = config
                .get(key)
                .and_then(|x| x.as_integer())
                .map(|x| x as u64);
            if res.is_some() {
                return res;
            }
            env::var(get_env_name(key))
                .ok()
                .and_then(|x| x.as_str().parse().ok())
        }
        Err(_) => None, // TODO log errors
    }
}

pub fn boolean_key(key: &str) -> Option<bool> {
    match get_config() {
        Ok(config) => {
            let res = config.get(key).and_then(|x| x.as_bool());
            if res.is_some() {
                return res;
            }
            env::var(get_env_name(key))
                .ok()
                .and_then(|x| (x.as_str()).parse().ok())
        }
        Err(_) => None, // TODO log errors
    }
}

fn get_env_name(suffix: &str) -> String {
    let suffix_uppercase: String = suffix.replace('-', "_").to_uppercase();
    concat(ENV_PREFIX, suffix_uppercase.as_str())
}

fn get_config() -> Result<Table, Box<dyn Error>> {
    let config_path = get_cache_folder().join(CONFIG_FILE);
    Ok(read_to_string(config_path)?.parse()?)
}

fn concat(prefix: &str, suffix: &str) -> String {
    let mut version_label: String = prefix.to_owned();
    version_label.push_str(suffix);
    version_label
}
