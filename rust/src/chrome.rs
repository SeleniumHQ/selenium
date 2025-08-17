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
use crate::config::ARCH::{ARM64, X32};
use crate::config::OS::{LINUX, MACOS, WINDOWS};
use crate::downloads::{parse_json_from_url, read_version_from_link};
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::logger::Logger;
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_http_client, format_three_args, SeleniumManager, BETA, DASH_DASH_VERSION, DEV, NIGHTLY,
    OFFLINE_REQUEST_ERR_MSG, REG_VERSION_ARG, STABLE,
    UNAVAILABLE_DOWNLOAD_WITH_MIN_VERSION_ERR_MSG,
};
use anyhow::anyhow;
use anyhow::Error;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::option::Option;
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

pub const CHROME_NAME: &str = "chrome";
pub const CHROMEDRIVER_NAME: &str = "chromedriver";
const DRIVER_URL: &str = "https://chromedriver.storage.googleapis.com/";
const LATEST_RELEASE: &str = "LATEST_RELEASE";
const CFT_URL: &str = "https://googlechromelabs.github.io/chrome-for-testing/";
const GOOD_VERSIONS_ENDPOINT: &str = "known-good-versions-with-downloads.json";
const LATEST_VERSIONS_ENDPOINT: &str = "last-known-good-versions-with-downloads.json";
const CFT_MACOS_APP_NAME: &str =
    "Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const MIN_CHROME_VERSION_CFT: i32 = 113;
const MIN_CHROMEDRIVER_VERSION_CFT: i32 = 115;
const CHROMIUM_SNAP_LINK: &str = "/snap/bin/chromium";
const CHROMIUM_SNAP_BINARY: &str = "/snap/chromium/current/usr/lib/chromium-browser/chrome";

pub struct ChromeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
    pub tx: Sender<String>,
    pub rx: Receiver<String>,
    pub download_browser: bool,
    pub driver_url: Option<String>,
    pub browser_url: Option<String>,
}

impl ChromeManager {
    pub fn new() -> Result<Box<Self>, Error> {
        let browser_name = CHROME_NAME;
        let driver_name = CHROMEDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(ChromeManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
            tx,
            rx,
            download_browser: false,
            driver_url: None,
            browser_url: None,
        }))
    }

    fn create_latest_release_url(&self) -> String {
        format!(
            "{}{}",
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            LATEST_RELEASE
        )
    }

    fn create_latest_release_with_version_url(&self) -> String {
        format!(
            "{}{}_{}",
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            LATEST_RELEASE,
            self.get_major_browser_version()
        )
    }

    fn create_cft_url(&self, base_url: &str, endpoint: &str) -> String {
        format!("{}{}", base_url, endpoint)
    }

    fn create_cft_url_for_browsers(&self, endpoint: &str) -> String {
        self.create_cft_url(&self.get_browser_mirror_url_or_default(CFT_URL), endpoint)
    }

    fn create_cft_url_for_drivers(&self, endpoint: &str) -> String {
        self.create_cft_url(&self.get_driver_mirror_url_or_default(CFT_URL), endpoint)
    }

    fn request_driver_version_from_latest(&self, driver_url: &str) -> Result<String, Error> {
        self.log.debug(format!(
            "Reading {} version from {}",
            &self.driver_name, driver_url
        ));
        read_version_from_link(self.get_http_client(), driver_url, self.get_logger())
    }

    fn request_versions_from_online<T>(&self, driver_url: &str) -> Result<T, Error>
    where
        T: Serialize + for<'a> Deserialize<'a>,
    {
        self.log
            .debug(format!("Discovering versions from {}", driver_url));
        parse_json_from_url::<T>(self.get_http_client(), driver_url)
    }

    fn request_latest_driver_version_from_online(&mut self) -> Result<String, Error> {
        let driver_name = self.driver_name;
        self.get_logger().trace(format!(
            "Using Chrome for Testing (CfT) endpoints to find out latest stable {} version",
            driver_name
        ));

        let latest_versions_url = self.create_cft_url_for_drivers(LATEST_VERSIONS_ENDPOINT);
        let versions_with_downloads =
            self.request_versions_from_online::<LatestVersionsWithDownloads>(&latest_versions_url)?;
        let stable_channel = versions_with_downloads.channels.stable;
        let chromedriver = stable_channel.downloads.chromedriver;
        if chromedriver.is_none() {
            self.log.warn(format!(
                "Latest stable version of {} not found using CfT endpoints. Trying with {}",
                &self.driver_name, LATEST_RELEASE
            ));
            return self.request_driver_version_from_latest(&self.create_latest_release_url());
        }

        let platform_url: Vec<&PlatformUrl> = chromedriver
            .as_ref()
            .unwrap()
            .iter()
            .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
            .collect();
        self.log.trace(format!(
            "CfT URLs for downloading {}: {:?}",
            self.get_driver_name(),
            platform_url
        ));
        self.driver_url = Some(platform_url.first().unwrap().url.to_string());

        Ok(stable_channel.version)
    }

    fn request_good_driver_version_from_online(&mut self) -> Result<String, Error> {
        let browser_or_driver_version = if self.get_driver_version().is_empty() {
            self.get_browser_version()
        } else {
            self.get_driver_version()
        };
        let version_for_filtering = self.get_major_version(browser_or_driver_version)?;
        self.log.trace(format!(
            "Driver version used to request CfT: {version_for_filtering}"
        ));

        let good_versions_url = self.create_cft_url_for_drivers(GOOD_VERSIONS_ENDPOINT);
        let all_versions =
            self.request_versions_from_online::<VersionsWithDownloads>(&good_versions_url)?;
        let filtered_versions: Vec<Version> = all_versions
            .versions
            .into_iter()
            .filter(|r| r.version.starts_with(version_for_filtering.as_str()))
            .collect();
        if filtered_versions.is_empty() {
            return Err(anyhow!(format_three_args(
                UNAVAILABLE_DOWNLOAD_WITH_MIN_VERSION_ERR_MSG,
                self.get_driver_name(),
                &version_for_filtering,
                &MIN_CHROMEDRIVER_VERSION_CFT.to_string(),
            )));
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
}

impl SeleniumManager for ChromeManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_names_in_path(&self) -> Vec<&str> {
        vec![self.get_browser_name(), "chromium-browser", "chromium"]
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
                r"Google\Chrome\Application\chrome.exe",
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                r"Google\Chrome Beta\Application\chrome.exe",
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r"Google\Chrome Dev\Application\chrome.exe",
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r"Google\Chrome SxS\Application\chrome.exe",
            ),
            (
                BrowserPath::new(MACOS, STABLE),
                "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            ),
            (
                BrowserPath::new(MACOS, BETA),
                "/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta",
            ),
            (
                BrowserPath::new(MACOS, DEV),
                "/Applications/Google Chrome Dev.app/Contents/MacOS/Google Chrome Dev",
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
            ),
            (BrowserPath::new(LINUX, STABLE), "/usr/bin/google-chrome"),
            (BrowserPath::new(LINUX, BETA), "/usr/bin/google-chrome-beta"),
            (
                BrowserPath::new(LINUX, DEV),
                "/usr/bin/google-chrome-unstable",
            ),
        ])
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error> {
        self.general_discover_browser_version(
            r"HKCU\Software\Google\Chrome\BLBeacon",
            REG_VERSION_ARG,
            DASH_DASH_VERSION,
        )
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Error> {
        let major_browser_version_binding = self.get_major_browser_version();
        let major_browser_version = major_browser_version_binding.as_str();
        let cache_path = self.get_cache_path()?;
        let mut metadata = get_metadata(self.get_logger(), &cache_path);

        match get_driver_version_from_metadata(
            &metadata.drivers,
            self.driver_name,
            major_browser_version,
        ) {
            Some(driver_version) => {
                self.log.trace(format!(
                    "Driver TTL is valid. Getting {} version from metadata",
                    &self.driver_name
                ));
                Ok(driver_version)
            }
            _ => {
                self.assert_online_or_err(OFFLINE_REQUEST_ERR_MSG)?;

                let major_browser_version_int =
                    major_browser_version.parse::<i32>().unwrap_or_default();
                let driver_version = if self.is_browser_version_stable()
                    || major_browser_version.is_empty()
                    || self.is_browser_version_unstable()
                {
                    // For discovering the latest driver version, the CfT endpoints are also used
                    self.request_latest_driver_version_from_online()?
                } else if !major_browser_version.is_empty()
                    && major_browser_version_int < MIN_CHROMEDRIVER_VERSION_CFT
                {
                    // For old versions (chromedriver 114-), the traditional method should work:
                    // https://chromedriver.chromium.org/downloads
                    self.request_driver_version_from_latest(
                        &self.create_latest_release_with_version_url(),
                    )?
                } else {
                    // As of chromedriver 115+, the metadata for version discovery are published
                    // by the "Chrome for Testing" (CfT) JSON endpoints:
                    // https://googlechromelabs.github.io/chrome-for-testing/
                    self.request_good_driver_version_from_online()?
                };

                let driver_ttl = self.get_ttl();
                if driver_ttl > 0 && !major_browser_version.is_empty() && !driver_version.is_empty()
                {
                    metadata.drivers.push(create_driver_metadata(
                        major_browser_version,
                        self.driver_name,
                        &driver_version,
                        driver_ttl,
                    ));
                    write_metadata(&metadata, self.get_logger(), cache_path);
                }
                Ok(driver_version)
            }
        }
    }

    fn request_browser_version(&mut self) -> Result<Option<String>, Error> {
        self.general_request_browser_version(self.browser_name)
    }

    fn get_driver_url(&mut self) -> Result<String, Error> {
        let major_driver_version = self
            .get_major_driver_version()
            .parse::<i32>()
            .unwrap_or_default();

        if major_driver_version >= MIN_CHROMEDRIVER_VERSION_CFT && self.driver_url.is_none() {
            // This case happens when driver_version is set (e.g. using CLI flag)
            self.request_good_driver_version_from_online()?;
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
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            driver_version,
            self.driver_name,
            driver_label
        ))
    }

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Error> {
        Ok(compose_driver_path_in_cache(
            self.get_cache_path()?.unwrap_or_default(),
            self.driver_name,
            self.get_os(),
            self.get_platform_label(),
            self.get_driver_version(),
        ))
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

    fn get_sender(&self) -> &Sender<String> {
        &self.tx
    }

    fn get_receiver(&self) -> &Receiver<String> {
        &self.rx
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

    fn request_latest_browser_version_from_online(
        &mut self,
        _browser_version: &str,
    ) -> Result<String, Error> {
        let browser_name = self.browser_name;
        self.get_logger().trace(format!(
            "Using Chrome for Testing (CfT) endpoints to find out latest stable {} version",
            browser_name
        ));

        let latest_versions_url = self.create_cft_url_for_browsers(LATEST_VERSIONS_ENDPOINT);
        let versions_with_downloads =
            self.request_versions_from_online::<LatestVersionsWithDownloads>(&latest_versions_url)?;
        let stable_channel = versions_with_downloads.channels.stable;
        let chrome = stable_channel.downloads.chrome;

        let platform_url: Vec<&PlatformUrl> = chrome
            .iter()
            .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
            .collect();
        self.log.trace(format!(
            "CfT URLs for downloading {}: {:?}",
            self.get_browser_name(),
            platform_url
        ));
        let browser_version = stable_channel.version;
        self.browser_url = Some(platform_url.first().unwrap().url.to_string());

        Ok(browser_version)
    }

    fn request_fixed_browser_version_from_online(
        &mut self,
        _browser_version: &str,
    ) -> Result<String, Error> {
        let browser_name = self.browser_name;
        let mut browser_version = self.get_browser_version().to_string();
        let major_browser_version = self.get_major_browser_version();
        self.get_logger().trace(format!(
            "Using Chrome for Testing (CfT) endpoints to find out {} {}",
            browser_name, major_browser_version
        ));

        if self.is_browser_version_unstable() {
            let latest_versions_url = self.create_cft_url_for_browsers(LATEST_VERSIONS_ENDPOINT);
            let versions_with_downloads = self
                .request_versions_from_online::<LatestVersionsWithDownloads>(
                    &latest_versions_url,
                )?;
            let channel = if browser_version.eq_ignore_ascii_case(BETA) {
                versions_with_downloads.channels.beta
            } else if browser_version.eq_ignore_ascii_case(DEV) {
                versions_with_downloads.channels.dev
            } else {
                versions_with_downloads.channels.canary
            };
            browser_version = channel.version;
            let platform_url: Vec<&PlatformUrl> = channel
                .downloads
                .chrome
                .iter()
                .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
                .collect();
            self.browser_url = Some(platform_url.first().unwrap().url.to_string());

            Ok(browser_version)
        } else {
            let good_versions_url = self.create_cft_url_for_browsers(GOOD_VERSIONS_ENDPOINT);
            let all_versions =
                self.request_versions_from_online::<VersionsWithDownloads>(&good_versions_url)?;
            let iter_versions = all_versions.versions.into_iter();
            let filtered_versions: Vec<Version> = if self.is_browser_version_specific() {
                iter_versions
                    .filter(|r| r.version.eq(browser_version.as_str()))
                    .collect()
            } else {
                iter_versions
                    .filter(|r| r.version.starts_with(major_browser_version.as_str()))
                    .collect()
            };
            if filtered_versions.is_empty() {
                return self.unavailable_download();
            }
            let last_browser = filtered_versions.last().unwrap();
            let platform_url: Vec<&PlatformUrl> = last_browser
                .downloads
                .chrome
                .iter()
                .filter(|p| p.platform.eq_ignore_ascii_case(self.get_platform_label()))
                .collect();
            self.browser_url = Some(platform_url.first().unwrap().url.to_string());

            Ok(last_browser.version.to_string())
        }
    }

    fn get_min_browser_version_for_download(&self) -> Result<i32, Error> {
        Ok(MIN_CHROME_VERSION_CFT)
    }

    fn get_browser_binary_path(&mut self, _browser_version: &str) -> Result<PathBuf, Error> {
        let browser_in_cache = self.get_browser_path_in_cache()?;
        if MACOS.is(self.get_os()) {
            Ok(browser_in_cache.join(CFT_MACOS_APP_NAME))
        } else {
            Ok(browser_in_cache.join(self.get_browser_name_with_extension()))
        }
    }

    fn get_browser_url_for_download(&mut self, browser_version: &str) -> Result<String, Error> {
        if let Some(browser_url) = self.browser_url.clone() {
            Ok(browser_url)
        } else {
            if self.is_browser_version_stable() || self.is_browser_version_empty() {
                self.request_latest_browser_version_from_online(browser_version)?;
            } else {
                self.request_fixed_browser_version_from_online(browser_version)?;
            }
            Ok(self.browser_url.clone().unwrap())
        }
    }

    fn get_browser_label_for_download(
        &self,
        _browser_version: &str,
    ) -> Result<Option<&str>, Error> {
        Ok(None)
    }

    fn is_download_browser(&self) -> bool {
        self.download_browser
    }

    fn set_download_browser(&mut self, download_browser: bool) {
        self.download_browser = download_browser;
    }

    fn is_snap(&self, browser_path: &str) -> bool {
        LINUX.is(self.get_os())
            && (browser_path.eq(CHROMIUM_SNAP_LINK) || browser_path.eq(CHROMIUM_SNAP_BINARY))
    }

    fn get_snap_path(&self) -> Option<PathBuf> {
        Some(Path::new(CHROMIUM_SNAP_BINARY).to_path_buf())
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
