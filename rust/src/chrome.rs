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
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error;
use std::option::Option;
use std::path::PathBuf;

use crate::config::ARCH::{ARM64, X32};
use crate::config::OS::{LINUX, MACOS, WINDOWS};
use crate::downloads::{parse_json_from_url, read_version_from_link};
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::logger::Logger;
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_http_client, format_one_arg, format_three_args, SeleniumManager, BETA,
    DASH_DASH_VERSION, DEV, ENV_LOCALAPPDATA, ENV_PROGRAM_FILES, ENV_PROGRAM_FILES_X86, NIGHTLY,
    OFFLINE_REQUEST_ERR_MSG, REG_QUERY, REMOVE_X86, STABLE, WMIC_COMMAND, WMIC_COMMAND_ENV,
};

pub const CHROME_NAME: &str = "chrome";
pub const CHROMEDRIVER_NAME: &str = "chromedriver";
const DRIVER_URL: &str = "https://chromedriver.storage.googleapis.com/";
const LATEST_RELEASE: &str = "LATEST_RELEASE";
const CFT_URL: &str = "https://googlechromelabs.github.io/chrome-for-testing/";
const GOOD_VERSIONS_ENDPOINT: &str = "known-good-versions-with-downloads.json";
const LATEST_VERSIONS_ENDPOINT: &str = "last-known-good-versions-with-downloads.json";

pub struct ChromeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
    pub driver_url: Option<String>,
}

impl ChromeManager {
    pub fn new() -> Result<Box<Self>, Box<dyn Error>> {
        let browser_name = CHROME_NAME;
        let driver_name = CHROMEDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        Ok(Box::new(ChromeManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::default(),
            driver_url: None,
        }))
    }

    fn create_latest_release_url(&self) -> String {
        format!("{}{}", DRIVER_URL, LATEST_RELEASE)
    }

    fn create_latest_release_with_version_url(&self) -> String {
        format!(
            "{}{}_{}",
            DRIVER_URL,
            LATEST_RELEASE,
            self.get_major_browser_version()
        )
    }

    fn create_good_versions_url(&self) -> String {
        format!("{}{}", CFT_URL, GOOD_VERSIONS_ENDPOINT)
    }

    fn create_latest_versions_url(&self) -> String {
        format!("{}{}", CFT_URL, LATEST_VERSIONS_ENDPOINT)
    }

    fn request_driver_version_from_latest(
        &self,
        driver_url: String,
    ) -> Result<String, Box<dyn Error>> {
        self.log.debug(format!(
            "Reading {} version from {}",
            &self.driver_name, driver_url
        ));
        read_version_from_link(self.get_http_client(), driver_url, self.get_logger())
    }

    fn request_versions_from_cft<T>(&self, driver_url: String) -> Result<T, Box<dyn Error>>
    where
        T: Serialize + for<'a> Deserialize<'a>,
    {
        self.log.debug(format!(
            "Reading {} metadata from {}",
            &self.driver_name, driver_url
        ));
        parse_json_from_url::<T>(self.get_http_client(), driver_url)
    }

    fn request_latest_driver_version_from_cft(&mut self) -> Result<String, Box<dyn Error>> {
        let versions_with_downloads = self
            .request_versions_from_cft::<LatestVersionsWithDownloads>(
                self.create_latest_versions_url(),
            )?;

        let stable_channel = versions_with_downloads.channels.stable;
        let chromedriver = stable_channel.downloads.chromedriver;
        if chromedriver.is_none() {
            // This should be temporal, since currently the stable channel has no chromedriver download
            self.log.warn(format!(
                "Latest stable version of {} not found using CfT endpoints. Trying with {}",
                &self.driver_name, LATEST_RELEASE
            ));
            return self.request_driver_version_from_latest(self.create_latest_release_url());
        }

        let url: Vec<&PlatformUrl> = chromedriver
            .as_ref()
            .unwrap()
            .iter()
            .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
            .collect();
        self.log.trace(format!("URLs for CfT: {:?}", url));
        self.driver_url = Some(url.first().unwrap().url.to_string());

        Ok(stable_channel.version)
    }

    fn request_good_version_from_cft(&mut self) -> Result<String, Box<dyn Error>> {
        let browser_or_driver_version = if self.get_driver_version().is_empty() {
            self.get_browser_version()
        } else {
            self.get_driver_version()
        };
        let version_for_filtering = self.get_major_version(browser_or_driver_version)?;
        self.log.trace(format!(
            "Driver version used to request CfT: {version_for_filtering}"
        ));

        let all_versions = self
            .request_versions_from_cft::<VersionsWithDownloads>(self.create_good_versions_url())?;
        let filtered_versions: Vec<Version> = all_versions
            .versions
            .into_iter()
            .filter(|r| r.version.starts_with(version_for_filtering.as_str()))
            .collect();
        if filtered_versions.is_empty() {
            return Err(format!(
                "{} {} not available",
                self.get_driver_name(),
                version_for_filtering
            )
            .into());
        }

        let driver_version = filtered_versions.last().unwrap();
        let url: Vec<&PlatformUrl> = driver_version
            .downloads
            .chromedriver
            .as_ref()
            .unwrap()
            .iter()
            .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
            .collect();
        self.log.trace(format!("URLs for CfT: {:?}", url));
        self.driver_url = Some(url.first().unwrap().url.to_string());

        Ok(driver_version.version.to_string())
    }

    fn get_platform_label(&self) -> &str {
        let os = self.get_os();
        let arch = self.get_arch();
        if WINDOWS.is(os) {
            if X32.is(arch) {
                "win32"
            } else {
                "win64"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mac-arm64"
            } else {
                "mac-x64"
            }
        } else {
            "linux64"
        }
    }
}

impl SeleniumManager for ChromeManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_http_client(&self) -> &Client {
        &self.http_client
    }

    fn set_http_client(&mut self, http_client: Client) {
        self.http_client = http_client;
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
        let mut commands;
        let escaped_browser_path = self.get_escaped_browser_path();
        let mut browser_path = escaped_browser_path.as_str();
        if browser_path.is_empty() {
            match self.detect_browser_path() {
                Some(path) => {
                    browser_path = path;
                    commands = vec![
                        format_three_args(
                            WMIC_COMMAND_ENV,
                            ENV_PROGRAM_FILES,
                            REMOVE_X86,
                            browser_path,
                        ),
                        format_three_args(
                            WMIC_COMMAND_ENV,
                            ENV_PROGRAM_FILES_X86,
                            "",
                            browser_path,
                        ),
                        format_three_args(WMIC_COMMAND_ENV, ENV_LOCALAPPDATA, "", browser_path),
                    ];
                    if !self.is_browser_version_unstable() {
                        commands.push(format_one_arg(
                            REG_QUERY,
                            r#"HKCU\Software\Google\Chrome\BLBeacon"#,
                        ));
                    }
                }
                _ => return None,
            }
        } else {
            commands = vec![format_one_arg(WMIC_COMMAND, browser_path)];
        }
        if !WINDOWS.is(self.get_os()) {
            commands = vec![format_one_arg(DASH_DASH_VERSION, browser_path)]
        }
        self.detect_browser_version(commands)
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Box<dyn Error>> {
        let browser_version_binding = self.get_major_browser_version();
        let browser_version = browser_version_binding.as_str();
        let mut metadata = get_metadata(self.get_logger());

        match get_driver_version_from_metadata(&metadata.drivers, self.driver_name, browser_version)
        {
            Some(driver_version) => {
                self.log.trace(format!(
                    "Driver TTL is valid. Getting {} version from metadata",
                    &self.driver_name
                ));
                Ok(driver_version)
            }
            _ => {
                self.assert_online_or_err(OFFLINE_REQUEST_ERR_MSG)?;

                let major_browser_version = browser_version.parse::<i32>().unwrap_or_default();
                let driver_version = if !browser_version.is_empty() && major_browser_version < 115 {
                    // For old versions (chromedriver 114-), the traditional method should work:
                    // https://chromedriver.chromium.org/downloads
                    self.request_driver_version_from_latest(
                        self.create_latest_release_with_version_url(),
                    )?
                } else if browser_version.is_empty() {
                    // For discovering the latest driver version, the CfT endpoints are also used
                    self.request_latest_driver_version_from_cft()?
                } else {
                    // As of chromedriver 115+, the metadata for version discovery are published
                    // by the "Chrome for Testing" (CfT) JSON endpoints:
                    // https://googlechromelabs.github.io/chrome-for-testing/
                    self.request_good_version_from_cft()?
                };

                let driver_ttl = self.get_driver_ttl();
                if driver_ttl > 0 && !browser_version.is_empty() && !driver_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        browser_version,
                        self.driver_name,
                        &driver_version,
                        driver_ttl,
                    ));
                    write_metadata(&metadata, self.get_logger());
                }
                Ok(driver_version)
            }
        }
    }

    fn get_driver_url(&mut self) -> Result<String, Box<dyn Error>> {
        let major_driver_version = self
            .get_major_driver_version()
            .parse::<i32>()
            .unwrap_or_default();

        if major_driver_version >= 115 && self.driver_url.is_none() {
            // This case happens when driver_version is set (e.g. using CLI flag)
            self.request_good_version_from_cft()?;
        }

        // As of Chrome 115+, the driver URL is already gathered thanks to the CfT endpoints
        if self.driver_url.is_some() {
            return Ok(self.driver_url.as_ref().unwrap().to_string());
        }

        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();
        let driver_label = if WINDOWS.is(os) {
            "win32"
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                // As of chromedriver 106, the naming convention for macOS ARM64 releases changed. See:
                // https://groups.google.com/g/chromedriver-users/c/JRuQzH3qr2c
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
        let arch_folder = self.get_platform_label();
        compose_driver_path_in_cache(self.driver_name, os, arch_folder, driver_version)
    }

    fn get_config(&self) -> &ManagerConfig {
        &self.config
    }

    fn get_config_mut(&mut self) -> &mut ManagerConfig {
        &mut self.config
    }

    fn set_config(&mut self, config: ManagerConfig) {
        self.config = config;
    }

    fn get_logger(&self) -> &Logger {
        &self.log
    }

    fn set_logger(&mut self, log: Logger) {
        self.log = log;
    }
}

#[derive(Serialize, Deserialize)]
pub struct LatestVersionsWithDownloads {
    pub timestamp: String,
    pub channels: Channels,
}

#[derive(Serialize, Deserialize)]
pub struct Channels {
    #[serde(rename = "Stable")]
    pub stable: Channel,
    #[serde(rename = "Beta")]
    pub beta: Channel,
    #[serde(rename = "Dev")]
    pub dev: Channel,
    #[serde(rename = "Canary")]
    pub canary: Channel,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Channel {
    pub channel: String,
    pub version: String,
    pub revision: String,
    pub downloads: Downloads,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct VersionsWithDownloads {
    pub timestamp: String,
    pub versions: Vec<Version>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Version {
    pub version: String,
    pub revision: String,
    pub downloads: Downloads,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Downloads {
    pub chrome: Vec<PlatformUrl>,
    pub chromedriver: Option<Vec<PlatformUrl>>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PlatformUrl {
    pub platform: String,
    pub url: String,
}
