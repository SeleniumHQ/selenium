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

use crate::config::ARCH::ARM64;
use crate::config::OS::{LINUX, MACOS, WINDOWS};
use crate::downloads::read_content_from_link;
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    SeleniumManager, BETA, DASH_DASH_VERSION, DEV, ENV_LOCALAPPDATA, ENV_PROGRAM_FILES,
    ENV_PROGRAM_FILES_X86, NIGHTLY, REG_QUERY, STABLE, WMIC_COMMAND,
};

const BROWSER_NAME: &str = "chrome";
const DRIVER_NAME: &str = "chromedriver";
const DRIVER_URL: &str = "https://chromedriver.storage.googleapis.com/";
const LATEST_RELEASE: &str = "LATEST_RELEASE";

pub struct ChromeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
}

impl ChromeManager {
    pub fn new() -> Box<Self> {
        Box::new(ChromeManager {
            browser_name: BROWSER_NAME,
            driver_name: DRIVER_NAME,
            config: ManagerConfig::default(),
        })
    }
}

impl SeleniumManager for ChromeManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str> {
        HashMap::from([
            (
                BrowserPath::new(WINDOWS, STABLE),
                r#"\\Google\\Chrome\\Application\\chrome.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                r#"\\Google\\Chrome Beta\\Application\\chrome.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r#"\\Google\\Chrome Dev\\Application\\chrome.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r#"\\Google\\Chrome SxS\\Application\\chrome.exe"#,
            ),
            (
                BrowserPath::new(MACOS, STABLE),
                r#"/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"#,
            ),
            (
                BrowserPath::new(MACOS, BETA),
                r#"/Applications/Google\ Chrome\ Beta.app/Contents/MacOS/Google\ Chrome\ Beta"#,
            ),
            (
                BrowserPath::new(MACOS, DEV),
                r#"/Applications/Google\ Chrome\ Dev.app/Contents/MacOS/Google\ Chrome\ Dev"#,
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                r#"/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary"#,
            ),
            (BrowserPath::new(LINUX, STABLE), "google-chrome"),
            (BrowserPath::new(LINUX, BETA), "google-chrome-beta"),
            (BrowserPath::new(LINUX, DEV), "google-chrome-unstable"),
        ])
    }

    fn discover_browser_version(&self) -> Option<String> {
        match self.get_browser_path() {
            Some(browser_path) => {
                let (shell, flag, args) =
                    if WINDOWS.is(self.get_os()) {
                        let mut commands = vec![
                            self.format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES, browser_path),
                            self.format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES_X86, browser_path),
                            self.format_two_args(WMIC_COMMAND, ENV_LOCALAPPDATA, browser_path),
                        ];
                        if !self.is_browser_version_unstable() {
                            commands.push(self.format_one_arg(
                                REG_QUERY,
                                r#"HKCU\Software\Google\Chrome\BLBeacon"#,
                            ));
                        }
                        ("cmd", "/C", commands)
                    } else {
                        (
                            "sh",
                            "-c",
                            vec![self.format_one_arg(DASH_DASH_VERSION, browser_path)],
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
                let driver_url = if browser_version.is_empty() {
                    format!("{}{}", DRIVER_URL, LATEST_RELEASE)
                } else {
                    format!("{}{}_{}", DRIVER_URL, LATEST_RELEASE, browser_version)
                };
                log::debug!("Reading {} version from {}", &self.driver_name, driver_url);
                let driver_version = read_content_from_link(driver_url)?;

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
        let driver_label = if WINDOWS.is(os) {
            "win32"
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                // As of chromedriver 106, the naming convention for macOS ARM64 releases changed. See:
                // https://groups.google.com/g/chromedriver-users/c/JRuQzH3qr2c
                let major_driver_version = self
                    .get_major_version(driver_version)?
                    .parse::<i32>()
                    .unwrap_or_default();
                if major_driver_version < 106 {
                    "mac64_m1"
                } else {
                    "mac_arm64"
                }
            } else {
                "mac64"
            }
        } else {
            "linux64"
        };
        Ok(format!(
            "{}{}/{}_{}.zip",
            DRIVER_URL, driver_version, self.driver_name, driver_label
        ))
    }

    fn get_driver_path_in_cache(&self) -> PathBuf {
        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();
        let arch_folder = if WINDOWS.is(os) {
            "win32"
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mac-arm64"
            } else {
                "mac64"
            }
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
