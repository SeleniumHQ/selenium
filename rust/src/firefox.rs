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

use crate::config::ManagerConfig;
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;

use crate::config::ARCH::{ARM64, X32};
use crate::config::OS::{LINUX, MACOS, WINDOWS};
use crate::downloads::read_redirect_from_link;
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    SeleniumManager, BETA, DASH_VERSION, DEV, ENV_PROGRAM_FILES, ENV_PROGRAM_FILES_X86, NIGHTLY,
    STABLE, WMIC_COMMAND,
};

const BROWSER_NAME: &str = "firefox";
const DRIVER_NAME: &str = "geckodriver";
const DRIVER_URL: &str = "https://github.com/mozilla/geckodriver/releases/";
const LATEST_RELEASE: &str = "latest";

pub struct FirefoxManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
}

impl FirefoxManager {
    pub fn new() -> Box<Self> {
        Box::new(FirefoxManager {
            browser_name: BROWSER_NAME,
            driver_name: DRIVER_NAME,
            config: ManagerConfig::default(),
        })
    }
}

impl SeleniumManager for FirefoxManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str> {
        HashMap::from([
            (
                BrowserPath::new(WINDOWS, STABLE),
                r#"\\Mozilla Firefox\\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                r#"\\Mozilla Firefox\\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r#"\\Firefox Developer Edition\\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r#"\\Firefox Nightly\\firefox.exe"#,
            ),
            (
                BrowserPath::new(MACOS, STABLE),
                r#"/Applications/Firefox.app/Contents/MacOS/firefox"#,
            ),
            (
                BrowserPath::new(MACOS, BETA),
                r#"/Applications/Firefox.app/Contents/MacOS/firefox"#,
            ),
            (
                BrowserPath::new(MACOS, DEV),
                r#"/Applications/Firefox\ Developer\ Edition.app/Contents/MacOS/firefox"#,
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                r#"/Applications/Firefox\ Nightly.app/Contents/MacOS/firefox"#,
            ),
            (BrowserPath::new(LINUX, STABLE), "firefox"),
            (BrowserPath::new(LINUX, BETA), "firefox"),
            (BrowserPath::new(LINUX, DEV), "firefox"),
            (BrowserPath::new(LINUX, NIGHTLY), "firefox-trunk"),
        ])
    }

    fn discover_browser_version(&self) -> Option<String> {
        match self.get_browser_path() {
            Some(browser_path) => {
                let (shell, flag, args) = if WINDOWS.is(self.get_os()) {
                    (
                        "cmd",
                        "/C",
                        vec![
                            self.format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES, browser_path),
                            self.format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES_X86, browser_path),
                        ],
                    )
                } else {
                    (
                        "sh",
                        "-c",
                        vec![self.format_one_arg(DASH_VERSION, browser_path)],
                    )
                };
                self.detect_browser_version(shell, flag, args)
            }
            _ => None,
        }
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&self) -> Result<String, Box<dyn Error>> {
        let browser_version = self.get_browser_version();
        let mut metadata = get_metadata();

        match get_driver_version_from_metadata(&metadata.drivers, self.driver_name, browser_version)
        {
            Some(driver_version) => {
                log::trace!(
                    "Driver TTL is valid. Getting {} version from metadata",
                    &self.driver_name
                );
                Ok(driver_version)
            }
            _ => {
                let latest_url = format!("{}{}", DRIVER_URL, LATEST_RELEASE);
                let driver_version = read_redirect_from_link(latest_url)?;

                if !browser_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        browser_version,
                        self.driver_name,
                        &driver_version,
                    ));
                    write_metadata(&metadata);
                }

                Ok(driver_version)
            }
        }
    }

    fn get_driver_url(&self) -> Result<String, Box<dyn Error>> {
        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();

        // As of 0.32.0, geckodriver ships aarch64 binaries for Linux and Windows
        // https://github.com/mozilla/geckodriver/releases/tag/v0.32.0
        let minor_driver_version = self
            .get_minor_version(driver_version)?
            .parse::<i32>()
            .unwrap_or_default();
        let driver_label = if WINDOWS.is(os) {
            if X32.is(arch) {
                "win32.zip"
            } else if ARM64.is(arch) && minor_driver_version > 31 {
                "win-aarch64.zip"
            } else {
                "win64.zip"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "macos-aarch64.tar.gz"
            } else {
                "macos.tar.gz"
            }
        } else if X32.is(arch) {
            "linux32.tar.gz"
        } else if ARM64.is(arch) && minor_driver_version > 31 {
            "linux-aarch64.tar.gz"
        } else {
            "linux64.tar.gz"
        };
        Ok(format!(
            "{}download/v{}/{}-v{}-{}",
            DRIVER_URL, driver_version, self.driver_name, driver_version, driver_label
        ))
    }

    fn get_driver_path_in_cache(&self) -> PathBuf {
        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();
        let minor_driver_version = self
            .get_minor_version(driver_version)
            .unwrap_or_default()
            .parse::<i32>()
            .unwrap_or_default();
        let arch_folder = if WINDOWS.is(os) {
            if X32.is(arch) {
                "win32"
            } else if ARM64.is(arch) && minor_driver_version > 31 {
                "win-arm64"
            } else {
                "win64"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mac-arm64"
            } else {
                "mac64"
            }
        } else if X32.is(arch) {
            "linux32"
        } else if ARM64.is(arch) && minor_driver_version > 31 {
            "linux-arm64"
        } else {
            "linux64"
        };
        compose_driver_path_in_cache(self.driver_name, os, arch_folder, driver_version)
    }

    fn get_config(&self) -> &ManagerConfig {
        &self.config
    }

    fn set_config(&mut self, config: ManagerConfig) {
        self.config = config;
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    #[test]
    fn test_driver_url() {
        let mut firefox_manager = FirefoxManager::new();

        let data = vec!(
            vec!("0.32.0", "linux", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux32.tar.gz"),
            vec!("0.32.0", "linux", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux64.tar.gz"),
            vec!("0.32.0", "linux", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-linux-aarch64.tar.gz"),
            vec!("0.32.0", "windows", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-win32.zip"),
            vec!("0.32.0", "windows", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-win64.zip"),
            vec!("0.32.0", "windows", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-win-aarch64.zip"),
            vec!("0.32.0", "macos", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-macos.tar.gz"),
            vec!("0.32.0", "macos", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-macos.tar.gz"),
            vec!("0.32.0", "macos", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.32.0/geckodriver-v0.32.0-macos-aarch64.tar.gz"),
            vec!("0.31.0", "linux", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux32.tar.gz"),
            vec!("0.31.0", "linux", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz"),
            vec!("0.31.0", "linux", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux64.tar.gz"),
            vec!("0.31.0", "windows", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-win32.zip"),
            vec!("0.31.0", "windows", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-win64.zip"),
            vec!("0.31.0", "windows", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-win64.zip"),
            vec!("0.31.0", "macos", "x86", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz"),
            vec!("0.31.0", "macos", "x86_64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos.tar.gz"),
            vec!("0.31.0", "macos", "aarch64", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-macos-aarch64.tar.gz"),
        );

        data.iter().for_each(|d| {
            firefox_manager.set_driver_version(d.first().unwrap().to_string());
            firefox_manager.set_os(d.get(1).unwrap().to_string());
            firefox_manager.set_arch(d.get(2).unwrap().to_string());
            let driver_url = firefox_manager.get_driver_url().unwrap();
            assert_eq!(d.get(3).unwrap().to_string(), driver_url);
        });
    }
}
