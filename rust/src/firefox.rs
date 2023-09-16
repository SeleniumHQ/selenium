// Licensed to the Software Freedom Conservancy (SFC) under one
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
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;

use crate::config::ARCH::{ARM64, X32};
use crate::config::OS::{LINUX, MACOS, WINDOWS};
use crate::downloads::{
    parse_generic_json_from_url, read_content_from_link, read_redirect_from_link,
};
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_browser_metadata, create_http_client, download_to_tmp_folder, format_three_args,
    format_two_args, get_browser_version_from_metadata, path_buf_to_string, uncompress, Logger,
    SeleniumManager, BETA, DASH_VERSION, DEV, NIGHTLY, OFFLINE_REQUEST_ERR_MSG,
    REG_CURRENT_VERSION_ARG, STABLE,
};

pub const FIREFOX_NAME: &str = "firefox";
pub const GECKODRIVER_NAME: &str = "geckodriver";
const DRIVER_URL: &str = "https://github.com/mozilla/geckodriver/releases/";
const LATEST_RELEASE: &str = "latest";
const BROWSER_URL: &str = "https://ftp.mozilla.org/pub/firefox/releases/";
const FIREFOX_DEFAULT_LANG: &str = "en-US";
const FIREFOX_MACOS_APP_NAME: &str = "Firefox.app/Contents/MacOS/firefox";
const FIREFOX_NIGHTLY_MACOS_APP_NAME: &str = "Firefox Nightly.app/Contents/MacOS/firefox";
const FIREFOX_DETAILS_URL: &str = "https://product-details.mozilla.org/1.0/";
const FIREFOX_STABLE_LABEL: &str = "LATEST_FIREFOX_VERSION";
const FIREFOX_BETA_LABEL: &str = "LATEST_FIREFOX_RELEASED_DEVEL_VERSION";
const FIREFOX_DEV_LABEL: &str = "FIREFOX_DEVEDITION";
const FIREFOX_CANARY_LABEL: &str = "FIREFOX_NIGHTLY";
const FIREFOX_VERSIONS_ENDPOINT: &str = "firefox_versions.json";
const FIREFOX_HISTORY_ENDPOINT: &str = "firefox_history_stability_releases.json";
const FIREFOX_HISTORY_DEV_ENDPOINT: &str = "firefox_history_development_releases.json";
const FIREFOX_NIGHTLY_URL: &str =
    "https://download.mozilla.org/?product=firefox-nightly-latest-ssl&os={}&lang={}";
const FIREFOX_VOLUME: &str = "Firefox";
const FIREFOX_NIGHTLY_VOLUME: &str = r#"Firefox\ Nightly"#;
const MIN_DOWNLOADABLE_FIREFOX_VERSION_WIN: i32 = 13;
const MIN_DOWNLOADABLE_FIREFOX_VERSION_MAC: i32 = 4;
const MIN_DOWNLOADABLE_FIREFOX_VERSION_LINUX: i32 = 4;
const ONLINE_DISCOVERY_ERROR_MESSAGE: &str = "Unable to discover {} {} in online repository";
const UNAVAILABLE_DOWNLOAD_ERROR_MESSAGE: &str =
    "{} {} not available for downloading (minimum version: {})";

pub struct FirefoxManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
}

impl FirefoxManager {
    pub fn new() -> Result<Box<Self>, Box<dyn Error>> {
        let browser_name = FIREFOX_NAME;
        let driver_name = GECKODRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        Ok(Box::new(FirefoxManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
        }))
    }

    fn create_firefox_details_url(&self, endpoint: &str) -> String {
        format!("{}{}", FIREFOX_DETAILS_URL, endpoint)
    }

    fn request_versions_from_online(
        &mut self,
        endpoint: &str,
    ) -> Result<Vec<String>, Box<dyn Error>> {
        let browser_version = self.get_browser_version().to_string();
        let firefox_versions_url = self.create_firefox_details_url(endpoint);
        let firefox_versions =
            parse_generic_json_from_url(self.get_http_client(), firefox_versions_url)?;

        let versions_map = firefox_versions.as_object().unwrap();
        let filter_key = if browser_version.contains('.') {
            browser_version
        } else {
            format!("{}.", browser_version)
        };
        Ok(versions_map
            .keys()
            .filter(|v| v.starts_with(&filter_key))
            .map(|v| v.to_string())
            .collect())
    }

    fn get_browser_url(&mut self) -> Result<String, Box<dyn Error>> {
        let arch = self.get_arch();
        let os = self.get_os();
        let platform_label;
        let artifact_name;
        let artifact_extension;
        let major_browser_version = self
            .get_major_browser_version()
            .parse::<i32>()
            .unwrap_or_default();

        if WINDOWS.is(os) {
            artifact_name = "Firefox%20Setup%20";
            artifact_extension = "exe";
            // Before Firefox 42, only Windows 32 was supported
            if X32.is(arch) || major_browser_version < 42 {
                platform_label = "win32";
            } else if ARM64.is(arch) {
                platform_label = "win-aarch64";
            } else {
                platform_label = "win64";
            }
        } else if MACOS.is(os) {
            artifact_name = "Firefox%20";
            // Before Firefox 68, only DMG was released
            if major_browser_version < 68 {
                artifact_extension = "dmg";
            } else {
                artifact_extension = "pkg";
            }
            if self.is_browser_version_nightly() {
                platform_label = "osx";
            } else {
                platform_label = "mac";
            }
        } else {
            // Linux
            artifact_name = "firefox-";
            artifact_extension = "tar.bz2";
            if X32.is(arch) {
                platform_label = "linux-i686";
            } else if self.is_browser_version_nightly() {
                platform_label = "linux64";
            } else {
                platform_label = "linux-x86_64";
            }
        }

        // A possible future improvement is to allow downloading language-specific releases
        let language = FIREFOX_DEFAULT_LANG;
        if self.is_browser_version_nightly() {
            Ok(format_two_args(
                FIREFOX_NIGHTLY_URL,
                platform_label,
                language,
            ))
        } else {
            let browser_version = self.get_browser_version();
            Ok(format!(
                "{}{}/{}/{}/{}{}.{}",
                BROWSER_URL,
                browser_version,
                platform_label,
                language,
                artifact_name,
                browser_version,
                artifact_extension
            ))
        }
    }

    fn get_browser_binary_path_in_cache(&self) -> Result<PathBuf, Box<dyn Error>> {
        let browser_in_cache = self.get_browser_path_in_cache()?;
        if MACOS.is(self.get_os()) {
            let macos_app_name = if self.is_browser_version_nightly() {
                FIREFOX_NIGHTLY_MACOS_APP_NAME
            } else {
                FIREFOX_MACOS_APP_NAME
            };
            Ok(browser_in_cache.join(macos_app_name))
        } else {
            Ok(browser_in_cache.join(self.get_browser_name_with_extension()))
        }
    }
}

impl SeleniumManager for FirefoxManager {
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
                r#"Mozilla Firefox\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                // "",
                r#"Mozilla Firefox\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r#"Firefox Developer Edition\firefox.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r#"Firefox Nightly\firefox.exe"#,
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
                r#"/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox"#,
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                r#"/Applications/Firefox Nightly.app/Contents/MacOS/firefox"#,
            ),
            (BrowserPath::new(LINUX, STABLE), "/usr/bin/firefox"),
            (BrowserPath::new(LINUX, BETA), "/usr/bin/firefox"),
            (BrowserPath::new(LINUX, DEV), "/usr/bin/firefox"),
            (BrowserPath::new(LINUX, NIGHTLY), "/usr/bin/firefox-trunk"),
        ])
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Box<dyn Error>> {
        self.general_discover_browser_version(
            r#"HKCU\Software\Mozilla\Mozilla Firefox"#,
            REG_CURRENT_VERSION_ARG,
            DASH_VERSION,
        )
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Box<dyn Error>> {
        let major_browser_version_binding = self.get_major_browser_version();
        let major_browser_version = major_browser_version_binding.as_str();
        let mut metadata = get_metadata(self.get_logger(), self.get_cache_path()?);

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

                let latest_url = format!("{}{}", DRIVER_URL, LATEST_RELEASE);
                let driver_version =
                    read_redirect_from_link(self.get_http_client(), latest_url, self.get_logger())?;

                let driver_ttl = self.get_ttl();
                if driver_ttl > 0 && !major_browser_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        major_browser_version,
                        self.driver_name,
                        &driver_version,
                        driver_ttl,
                    ));
                    write_metadata(&metadata, self.get_logger(), self.get_cache_path()?);
                }

                Ok(driver_version)
            }
        }
    }

    fn request_browser_version(&mut self) -> Result<Option<String>, Box<dyn Error>> {
        self.general_request_browser_version(self.browser_name)
    }

    fn get_driver_url(&mut self) -> Result<String, Box<dyn Error>> {
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

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Box<dyn Error>> {
        Ok(compose_driver_path_in_cache(
            self.get_cache_path()?,
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

    fn download_browser(&mut self) -> Result<Option<PathBuf>, Box<dyn Error>> {
        let browser_version;
        let browser_name = self.browser_name;
        let mut metadata = get_metadata(self.get_logger(), self.get_cache_path()?);
        let major_browser_version = self.get_major_browser_version();

        // Browser version is checked in the local metadata
        match get_browser_version_from_metadata(
            &metadata.browsers,
            browser_name,
            &major_browser_version,
        ) {
            Some(version) => {
                self.get_logger().trace(format!(
                    "Browser with valid TTL. Getting {} version from metadata",
                    browser_name
                ));
                browser_version = version;
                self.set_browser_version(browser_version.clone());
            }
            _ => {
                // If not in metadata, discover version using Mozilla online metadata
                if self.is_browser_version_stable() || self.is_browser_version_empty() {
                    browser_version = self.request_latest_browser_version_from_online()?;
                } else {
                    browser_version = self.request_fixed_browser_version_from_online()?;
                }
                self.set_browser_version(browser_version.clone());

                let browser_ttl = self.get_ttl();
                if browser_ttl > 0
                    && !self.is_browser_version_empty()
                    && !self.is_browser_version_stable()
                {
                    metadata.browsers.push(create_browser_metadata(
                        browser_name,
                        &major_browser_version,
                        &browser_version,
                        browser_ttl,
                    ));
                    write_metadata(&metadata, self.get_logger(), self.get_cache_path()?);
                }
            }
        }
        self.get_logger().debug(format!(
            "Required browser: {} {}",
            browser_name, browser_version
        ));

        // Checking if browser version is in the cache
        let browser_binary_path = self.get_browser_binary_path_in_cache()?;
        if browser_binary_path.exists() {
            self.get_logger().debug(format!(
                "{} {} already in the cache",
                browser_name, browser_version
            ));
        } else {
            // If browser is not in the cache, download it
            let browser_url = self.get_browser_url()?;
            self.get_logger().debug(format!(
                "Downloading {} {} from {}",
                self.get_browser_name(),
                self.get_browser_version(),
                browser_url
            ));
            let (_tmp_folder, driver_zip_file) =
                download_to_tmp_folder(self.get_http_client(), browser_url, self.get_logger())?;

            let major_browser_version_int = self
                .get_major_browser_version()
                .parse::<i32>()
                .unwrap_or_default();
            let volume = if self.is_browser_version_nightly() {
                FIREFOX_NIGHTLY_VOLUME
            } else {
                FIREFOX_VOLUME
            };
            uncompress(
                &driver_zip_file,
                &self.get_browser_path_in_cache()?,
                self.get_logger(),
                self.get_os(),
                None,
                Some(volume),
                Some(major_browser_version_int),
            )?;
        }
        if browser_binary_path.exists() {
            self.set_browser_path(path_buf_to_string(browser_binary_path.clone()));
            Ok(Some(browser_binary_path))
        } else {
            Ok(None)
        }
    }

    fn get_platform_label(&self) -> &str {
        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();
        let minor_driver_version = self
            .get_minor_version(driver_version)
            .unwrap_or_default()
            .parse::<i32>()
            .unwrap_or_default();
        if WINDOWS.is(os) {
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
        }
    }

    fn request_latest_browser_version_from_online(&mut self) -> Result<String, Box<dyn Error>> {
        let browser_name = self.browser_name;
        self.get_logger().trace(format!(
            "Using Firefox endpoints to find out latest stable {} version",
            browser_name
        ));

        let firefox_versions_url = self.create_firefox_details_url(FIREFOX_VERSIONS_ENDPOINT);
        let firefox_versions =
            parse_generic_json_from_url(self.get_http_client(), firefox_versions_url)?;
        let browser_version = firefox_versions
            .get(FIREFOX_STABLE_LABEL)
            .unwrap()
            .as_str()
            .unwrap();
        self.set_browser_version(browser_version.to_string());
        Ok(browser_version.to_string())
    }

    fn request_fixed_browser_version_from_online(&mut self) -> Result<String, Box<dyn Error>> {
        let browser_name = self.browser_name;
        let browser_version = self.get_browser_version().to_string();
        self.get_logger().trace(format!(
            "Using Firefox endpoints to find out {} {}",
            browser_name, browser_version
        ));

        if self.is_browser_version_unstable() {
            let firefox_versions_url = self.create_firefox_details_url(FIREFOX_VERSIONS_ENDPOINT);
            let firefox_versions =
                parse_generic_json_from_url(self.get_http_client(), firefox_versions_url)?;
            let version_label = if browser_version.eq_ignore_ascii_case(BETA) {
                FIREFOX_BETA_LABEL
            } else if browser_version.eq_ignore_ascii_case(DEV) {
                FIREFOX_DEV_LABEL
            } else {
                FIREFOX_CANARY_LABEL
            };
            let browser_version = firefox_versions
                .get(version_label)
                .unwrap()
                .as_str()
                .unwrap();
            Ok(browser_version.to_string())
        } else {
            let os = self.get_os();
            let major_browser_version = self
                .get_major_browser_version()
                .parse::<i32>()
                .unwrap_or_default();

            let min_downloadable_version = if WINDOWS.is(os) {
                MIN_DOWNLOADABLE_FIREFOX_VERSION_WIN
            } else if MACOS.is(os) {
                MIN_DOWNLOADABLE_FIREFOX_VERSION_MAC
            } else {
                MIN_DOWNLOADABLE_FIREFOX_VERSION_LINUX
            };
            if major_browser_version < min_downloadable_version {
                return Err(format_three_args(
                    UNAVAILABLE_DOWNLOAD_ERROR_MESSAGE,
                    browser_name,
                    &browser_version,
                    &min_downloadable_version.to_string(),
                )
                .into());
            }

            let mut firefox_versions =
                self.request_versions_from_online(FIREFOX_HISTORY_ENDPOINT)?;
            if firefox_versions.is_empty() {
                firefox_versions =
                    self.request_versions_from_online(FIREFOX_HISTORY_DEV_ENDPOINT)?;
                if firefox_versions.is_empty() {
                    return Err(format_two_args(
                        ONLINE_DISCOVERY_ERROR_MESSAGE,
                        browser_name,
                        self.get_browser_version(),
                    )
                    .into());
                }
            }

            for version in firefox_versions.iter().rev() {
                let release_url = format_two_args("{}{}/", BROWSER_URL, version);
                self.get_logger()
                    .trace(format!("Checking release URL: {}", release_url));
                let content = read_content_from_link(self.get_http_client(), release_url)?;
                if !content.contains("Not Found") {
                    return Ok(version.to_string());
                }
            }
            Err(format_two_args(
                ONLINE_DISCOVERY_ERROR_MESSAGE,
                browser_name,
                self.get_browser_version(),
            )
            .into())
        }
    }
}

#[cfg(test)]
mod unit_tests {
    use super::*;

    #[test]
    fn test_driver_url() {
        let mut firefox_manager = FirefoxManager::new().unwrap();

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
