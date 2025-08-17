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
use crate::shell::run_shell_command_by_os;
use crate::{
    default_cache_folder, format_one_arg, path_to_string, Command, ARCH_ARM7L,
    ENV_PROCESSOR_ARCHITECTURE, REQUEST_TIMEOUT_SEC, UNAME_COMMAND,
};
use crate::{ARCH_ARM64, ARCH_X64, ARCH_X86, TTL_SEC};
use anyhow::anyhow;
use anyhow::Error;
use std::cell::RefCell;
use std::env;
use std::env::consts::OS;
use std::fs::read_to_string;
use std::path::Path;
use toml::Table;
#[cfg(windows)]
use winapi::um::sysinfoapi::{GetNativeSystemInfo, SYSTEM_INFO};
#[cfg(windows)]
use winapi::um::winnt::{
    PROCESSOR_ARCHITECTURE_AMD64, PROCESSOR_ARCHITECTURE_ARM, PROCESSOR_ARCHITECTURE_ARM64,
    PROCESSOR_ARCHITECTURE_IA64, PROCESSOR_ARCHITECTURE_INTEL,
};

thread_local!(static CACHE_PATH: RefCell<String> = RefCell::new(path_to_string(&default_cache_folder())));

pub const CONFIG_FILE: &str = "se-config.toml";
pub const ENV_PREFIX: &str = "SE_";
pub const VERSION_PREFIX: &str = "-version";
pub const PATH_PREFIX: &str = "-path";
pub const MIRROR_PREFIX: &str = "-mirror-url";
pub const CACHE_PATH_KEY: &str = "cache-path";

pub struct ManagerConfig {
    pub cache_path: String,
    pub fallback_driver_from_cache: bool,
    pub browser_version: String,
    pub driver_version: String,
    pub browser_path: String,
    pub driver_mirror_url: String,
    pub browser_mirror_url: String,
    pub os: String,
    pub arch: String,
    pub proxy: String,
    pub timeout: u64,
    pub ttl: u64,
    pub offline: bool,
    pub force_browser_download: bool,
    pub avoid_browser_download: bool,
    pub language_binding: String,
    pub selenium_version: String,
    pub avoid_stats: bool,
    pub skip_driver_in_path: bool,
    pub skip_browser_in_path: bool,
}

impl ManagerConfig {
    pub fn default(browser_name: &str, driver_name: &str) -> ManagerConfig {
        let cache_path = StringKey(vec![CACHE_PATH_KEY], &read_cache_path()).get_value();

        let self_os = OS;
        let self_arch = if WINDOWS.is(self_os) {
            let mut _architecture = env::var(ENV_PROCESSOR_ARCHITECTURE).unwrap_or_default();
            #[cfg(windows)]
            {
                if _architecture.is_empty() {
                    _architecture = get_win_os_architecture();
                }
            }
            if _architecture.contains("32") {
                ARCH_X86.to_string()
            } else if _architecture.contains("ARM") {
                ARCH_ARM64.to_string()
            } else {
                ARCH_X64.to_string()
            }
        } else {
            let uname_a_command = Command::new_single(format_one_arg(UNAME_COMMAND, "a"));
            if run_shell_command_by_os(self_os, uname_a_command)
                .unwrap_or_default()
                .to_ascii_lowercase()
                .contains(ARCH_ARM64)
            {
                ARCH_ARM64.to_string()
            } else {
                let uname_m_command = Command::new_single(format_one_arg(UNAME_COMMAND, "m"));
                run_shell_command_by_os(self_os, uname_m_command).unwrap_or_default()
            }
        };

        let browser_version_label = concat(browser_name, VERSION_PREFIX);
        let driver_version_label = concat(driver_name, VERSION_PREFIX);
        let browser_path_label = concat(browser_name, PATH_PREFIX);
        let driver_mirror_label = concat(driver_name, MIRROR_PREFIX);
        let browser_mirror_label = concat(browser_name, MIRROR_PREFIX);

        ManagerConfig {
            cache_path,
            fallback_driver_from_cache: true,
            browser_version: StringKey(vec!["browser-version", &browser_version_label], "")
                .get_value(),
            driver_version: StringKey(vec!["driver-version", &driver_version_label], "")
                .get_value(),
            browser_path: StringKey(vec!["browser-path", &browser_path_label], "").get_value(),
            driver_mirror_url: StringKey(vec!["driver-mirror-url", &driver_mirror_label], "")
                .get_value(),
            browser_mirror_url: StringKey(vec!["browser-mirror-url", &browser_mirror_label], "")
                .get_value(),
            os: StringKey(vec!["os"], self_os).get_value(),
            arch: StringKey(vec!["arch"], self_arch.as_str()).get_value(),
            proxy: StringKey(vec!["proxy"], "").get_value(),
            timeout: IntegerKey("timeout", REQUEST_TIMEOUT_SEC).get_value(),
            ttl: IntegerKey("ttl", TTL_SEC).get_value(),
            offline: BooleanKey("offline", false).get_value(),
            force_browser_download: BooleanKey("force-browser-download", false).get_value(),
            avoid_browser_download: BooleanKey("avoid-browser-download", false).get_value(),
            language_binding: StringKey(vec!["language-binding"], "").get_value(),
            selenium_version: StringKey(vec!["selenium-version"], "").get_value(),
            avoid_stats: BooleanKey("avoid-stats", false).get_value(),
            skip_driver_in_path: BooleanKey("skip-driver-in-path", false).get_value(),
            skip_browser_in_path: BooleanKey("skip-browser-in-path", false).get_value(),
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
    pub fn to_str_vector(&self) -> Vec<&str> {
        match self {
            WINDOWS => vec!["windows", "win"],
            MACOS => vec!["macos", "mac"],
            LINUX => vec!["linux", "gnu/linux"],
        }
    }

    pub fn is(&self, os: &str) -> bool {
        self.to_str_vector()
            .contains(&os.to_ascii_lowercase().as_str())
    }
}

pub fn str_to_os(os: &str) -> Result<OS, Error> {
    if WINDOWS.is(os) {
        Ok(WINDOWS)
    } else if MACOS.is(os) {
        Ok(MACOS)
    } else if LINUX.is(os) {
        Ok(LINUX)
    } else {
        Err(anyhow!(format!("Invalid operating system: {os}")))
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
pub enum ARCH {
    X32,
    X64,
    ARM64,
    ARMV7,
}

impl ARCH {
    pub fn to_str_vector(&self) -> Vec<&str> {
        match self {
            ARCH::X32 => vec![ARCH_X86, "i386", "x32"],
            ARCH::X64 => vec![ARCH_X64, "amd64", "x64", "i686", "ia64"],
            ARCH::ARM64 => vec![ARCH_ARM64, "aarch64", "arm"],
            ARCH::ARMV7 => vec![ARCH_ARM7L, "armv7l"],
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
        let default_value = self.1.to_owned();
        let mut result;
        for key in keys {
            if config.contains_key(key) {
                result = config[key].as_str().unwrap().to_string()
            } else {
                result = env::var(get_env_name(key)).unwrap_or_default()
            }
            if key.eq(CACHE_PATH_KEY) {
                // The configuration key for the cache path ("cache-path") is special because
                // the rest of the configuration values depend on this value (since the
                // configuration file is stored in the cache path). Therefore, this value needs
                // to be discovered in the first place and stored globally (on CACHE_PATH)
                return check_cache_path(result, default_value);
            }
            if !result.is_empty() {
                return result;
            }
        }
        default_value
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

fn get_config() -> Result<Table, Error> {
    let cache_path = read_cache_path();
    let config_path = Path::new(&cache_path).to_path_buf().join(CONFIG_FILE);
    Ok(read_to_string(config_path)?.parse()?)
}

fn concat(prefix: &str, suffix: &str) -> String {
    let mut version_label: String = prefix.to_owned();
    version_label.push_str(suffix);
    version_label
}

fn check_cache_path(value_in_config_or_env: String, default_value: String) -> String {
    let return_value = if !value_in_config_or_env.is_empty() {
        value_in_config_or_env
    } else if !default_value.is_empty() {
        default_value
    } else {
        read_cache_path()
    };
    write_cache_path(return_value.clone());
    return_value
}

fn write_cache_path(cache_path: String) {
    CACHE_PATH.with(|value| {
        *value.borrow_mut() = cache_path;
    });
}

fn read_cache_path() -> String {
    let mut cache_path: String = path_to_string(&default_cache_folder());
    CACHE_PATH.with(|value| {
        let path: String = (&*value.borrow().to_string()).into();
        if !path.is_empty() {
            cache_path = path;
        }
    });
    cache_path
}

#[cfg(windows)]
fn get_win_os_architecture() -> String {
    unsafe {
        let mut system_info: SYSTEM_INFO = std::mem::zeroed();
        GetNativeSystemInfo(&mut system_info);

        match system_info.u.s() {
            si if si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_AMD64 => "64-bit",
            si if si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_INTEL => "32-bit",
            si if si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_ARM => "ARM",
            si if si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_ARM64 => "ARM64",
            si if si.wProcessorArchitecture == PROCESSOR_ARCHITECTURE_IA64 => "Itanium-based",
            _ => "Unknown",
        }
        .to_string()
    }
}
