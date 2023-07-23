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
use crate::{format_one_arg, run_shell_command_by_os, REQUEST_TIMEOUT_SEC, UNAME_COMMAND};
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
    pub browser_version: String,
    pub driver_version: String,
    pub browser_path: String,
    pub os: String,
    pub arch: String,
    pub proxy: String,
    pub timeout: u64,
    pub browser_ttl: u64,
    pub driver_ttl: u64,
    pub offline: bool,
    pub force_browser_download: bool,
}

impl ManagerConfig {
    pub fn default(browser_name: &str, driver_name: &str) -> ManagerConfig {
        let self_os = OS;
        let self_arch = if WINDOWS.is(self_os) {
            let wmic_output =
                run_shell_command_by_os(self_os, WMIC_COMMAND_OS.to_string()).unwrap_or_default();
            if wmic_output.contains("32") {
                ARCH_X86.to_string()
            } else if wmic_output.contains("ARM") {
                ARCH_ARM64.to_string()
            } else {
                ARCH_AMD64.to_string()
            }
        } else {
            let uname_a = format_one_arg(UNAME_COMMAND, "a");
            if run_shell_command_by_os(self_os, uname_a)
                .unwrap_or_default()
                .to_ascii_lowercase()
                .contains(ARCH_ARM64)
            {
                ARCH_ARM64.to_string()
            } else {
                let uname_m = format_one_arg(UNAME_COMMAND, "m");
                run_shell_command_by_os(self_os, uname_m).unwrap_or_default()
            }
        };

        let browser_version_label = concat(browser_name, VERSION_PREFIX);
        let driver_version_label = concat(driver_name, VERSION_PREFIX);
        let browser_path_label = concat(browser_name, PATH_PREFIX);

        ManagerConfig {
            browser_version: StringKey(vec!["browser-version", browser_version_label.as_str()], "")
                .get_value(),
            driver_version: StringKey(vec!["driver-version", driver_version_label.as_str()], "")
                .get_value(),
            browser_path: StringKey(vec!["browser-path", browser_path_label.as_str()], "")
                .get_value(),
            os: StringKey(vec!["os"], self_os).get_value(),
            arch: StringKey(vec!["arch"], self_arch.as_str()).get_value(),
            proxy: StringKey(vec!["proxy"], "").get_value(),
            timeout: IntegerKey("timeout", REQUEST_TIMEOUT_SEC).get_value(),
            browser_ttl: IntegerKey("browser-ttl", TTL_BROWSERS_SEC).get_value(),
            driver_ttl: IntegerKey("driver-ttl", TTL_DRIVERS_SEC).get_value(),
            offline: BooleanKey("offline", false).get_value(),
            force_browser_download: BooleanKey("force_browser_download", false).get_value(),
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

pub struct StringKey<'a>(pub Vec<&'a str>, pub &'a str);

impl StringKey<'_> {
    pub fn get_value(&self) -> String {
        let config = get_config().unwrap_or_default();
        let keys = self.0.to_owned();
        let mut result;
        for key in keys {
            if config.contains_key(key) {
                result = config[key].as_str().unwrap().to_string()
            } else {
                result = env::var(get_env_name(key)).unwrap_or_default()
            }
            if !result.is_empty() {
                return result;
            }
        }
        self.1.to_owned()
    }
}

pub struct IntegerKey<'a>(pub &'a str, pub u64);

impl IntegerKey<'_> {
    pub fn get_value(&self) -> u64 {
        let config = get_config().unwrap_or_default();
        let key = self.0;
        if config.contains_key(key) {
            config[key].as_integer().unwrap() as u64
        } else {
            env::var(get_env_name(key))
                .unwrap_or_default()
                .parse::<u64>()
                .unwrap_or_else(|_| self.1.to_owned())
        }
    }
}

pub struct BooleanKey<'a>(pub &'a str, pub bool);

impl BooleanKey<'_> {
    pub fn get_value(&self) -> bool {
        let config = get_config().unwrap_or_default();
        let key = self.0;
        if config.contains_key(key) {
            config[key].as_bool().unwrap()
        } else {
            env::var(get_env_name(key))
                .unwrap_or_default()
                .parse::<bool>()
                .unwrap_or_else(|_| self.1.to_owned())
        }
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
