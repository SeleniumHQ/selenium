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

use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::process::Command;

use crate::downloads::download_driver_to_tmp_folder;
use crate::files::{parse_version, uncompress};
use crate::manager::OS::{LINUX, MACOS, WINDOWS};

use crate::metadata::{
    create_browser_metadata, get_browser_version_from_metadata, get_metadata, write_metadata,
};

pub const STABLE: &str = "stable";
pub const BETA: &str = "beta";
pub const DEV: &str = "dev";
pub const CANARY: &str = "canary";
pub const NIGHTLY: &str = "nightly";
pub const WMIC_COMMAND: &str = r#"wmic datafile where name='%{}:\=\\%{}' get Version /value"#;
pub const REG_QUERY: &str = r#"REG QUERY {} /v version"#;
pub const DASH_VERSION: &str = "{} -v";
pub const DASH_DASH_VERSION: &str = "{} --version";
pub const ENV_PROGRAM_FILES: &str = "PROGRAMFILES";
pub const ENV_PROGRAM_FILES_X86: &str = "PROGRAMFILES(X86)";
pub const ENV_LOCALAPPDATA: &str = "LOCALAPPDATA";

pub trait BrowserManager {
    fn get_browser_name(&self) -> &str;

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str>;

    fn get_browser_version(&self, os: &str, browser_version: &str) -> Option<String>;

    fn get_driver_name(&self) -> &str;

    fn get_driver_version(&self, browser_version: &str, os: &str)
        -> Result<String, Box<dyn Error>>;

    fn get_driver_url(
        &self,
        driver_version: &str,
        os: &str,
        arch: &str,
    ) -> Result<String, Box<dyn Error>>;

    fn get_driver_path_in_cache(&self, driver_version: &str, os: &str, arch: &str) -> PathBuf;

    fn download_driver(
        &self,
        driver_version: &str,
        os: &str,
        arch: &str,
    ) -> Result<(), Box<dyn Error>> {
        let driver_url = Self::get_driver_url(self, driver_version, os, arch)?;
        let (_tmp_folder, driver_zip_file) = download_driver_to_tmp_folder(driver_url)?;
        let driver_path_in_cache = Self::get_driver_path_in_cache(self, driver_version, os, arch);
        uncompress(&driver_zip_file, driver_path_in_cache)
    }

    fn get_browser_path(&self, os: &str, mut browser_version: &str) -> Option<&str> {
        if browser_version.eq_ignore_ascii_case(CANARY) {
            browser_version = NIGHTLY;
        } else if browser_version.is_empty() {
            browser_version = STABLE;
        }
        self.get_browser_path_map()
            .get(&BrowserPath::new(str_to_os(os), browser_version))
            .cloned()
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

fn str_to_os(os: &str) -> OS {
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

#[derive(Hash, Eq, PartialEq, Debug)]
pub struct BrowserPath {
    os: OS,
    channel: String,
}

impl BrowserPath {
    pub fn new(os: OS, channel: &str) -> BrowserPath {
        BrowserPath {
            os,
            channel: channel.to_string(),
        }
    }
}

pub fn run_shell_command(
    command: &str,
    flag: &str,
    args: String,
) -> Result<String, Box<dyn Error>> {
    log::debug!("Running {} command: {:?}", command, args);
    let output = Command::new(command).args([flag, args.as_str()]).output()?;
    log::debug!("{:?}", output);

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn detect_browser_version(
    browser_name: &str,
    shell: &str,
    flag: &str,
    args: Vec<String>,
) -> Option<String> {
    let mut metadata = get_metadata();

    match get_browser_version_from_metadata(&metadata.browsers, browser_name) {
        Some(version) => {
            log::trace!(
                "Browser with valid TTL. Getting {} version from metadata",
                browser_name
            );
            Some(version)
        }
        _ => {
            log::debug!("Using shell command to find out {} version", browser_name);
            let mut browser_version = "".to_string();
            for arg in args.iter() {
                let output = match run_shell_command(shell, flag, arg.to_string()) {
                    Ok(out) => out,
                    Err(_e) => continue,
                };
                let full_browser_version = parse_version(output).unwrap_or_default();
                if full_browser_version.is_empty() {
                    continue;
                }
                log::debug!(
                    "The version of {} is {}",
                    browser_name,
                    full_browser_version
                );
                match get_major_version(&full_browser_version) {
                    Ok(v) => browser_version = v,
                    Err(_) => return None,
                }
                break;
            }

            metadata
                .browsers
                .push(create_browser_metadata(browser_name, &browser_version));
            write_metadata(&metadata);
            Some(browser_version)
        }
    }
}

pub fn get_major_version(full_version: &str) -> Result<String, Box<dyn Error>> {
    get_index_version(full_version, 0)
}

pub fn get_minor_version(full_version: &str) -> Result<String, Box<dyn Error>> {
    get_index_version(full_version, 1)
}

fn get_index_version(full_version: &str, index: usize) -> Result<String, Box<dyn Error>> {
    let version_vec: Vec<&str> = full_version.split('.').collect();
    Ok(version_vec
        .get(index)
        .ok_or(format!("Wrong version: {}", full_version))?
        .to_string())
}

pub fn format_one_arg(string: &str, arg1: &str) -> String {
    string.replacen("{}", arg1, 1)
}

pub fn format_two_args(string: &str, arg1: &str, arg2: &str) -> String {
    string.replacen("{}", arg1, 1).replacen("{}", arg2, 2)
}

pub fn is_unstable(browser_version: &str) -> bool {
    browser_version.eq_ignore_ascii_case(BETA)
        || browser_version.eq_ignore_ascii_case(DEV)
        || browser_version.eq_ignore_ascii_case(NIGHTLY)
        || browser_version.eq_ignore_ascii_case(CANARY)
}
