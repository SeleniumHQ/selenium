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
use crate::downloads::read_version_from_link;
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_http_client, Logger, SeleniumManager, BETA, DASH_DASH_VERSION, DEV, NIGHTLY,
    OFFLINE_REQUEST_ERR_MSG, REG_VERSION_ARG, STABLE,
};

pub const EDGE_NAMES: &[&str] = &["edge", "msedge", "microsoftedge"];
pub const EDGEDRIVER_NAME: &str = "msedgedriver";
const DRIVER_URL: &str = "https://msedgedriver.azureedge.net/";
const LATEST_STABLE: &str = "LATEST_STABLE";
const LATEST_RELEASE: &str = "LATEST_RELEASE";

pub struct EdgeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
}

impl EdgeManager {
    pub fn new() -> Result<Box<Self>, Box<dyn Error>> {
        let browser_name = EDGE_NAMES[0];
        let driver_name = EDGEDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        Ok(Box::new(EdgeManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
        }))
    }
}

impl SeleniumManager for EdgeManager {
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
                r#"Microsoft\Edge\Application\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                r#"Microsoft\Edge Beta\Application\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r#"Microsoft\Edge Dev\Application\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r#"Microsoft\Edge SxS\Application\msedge.exe"#,
            ),
            (
                BrowserPath::new(MACOS, STABLE),
                r#"/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"#,
            ),
            (
                BrowserPath::new(MACOS, BETA),
                r#"/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta"#,
            ),
            (
                BrowserPath::new(MACOS, DEV),
                r#"/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev"#,
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                r#"/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary"#,
            ),
            (BrowserPath::new(LINUX, STABLE), "/usr/bin/microsoft-edge"),
            (
                BrowserPath::new(LINUX, BETA),
                "/usr/bin/microsoft-edge-beta",
            ),
            (BrowserPath::new(LINUX, DEV), "/usr/bin/microsoft-edge-dev"),
        ])
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Box<dyn Error>> {
        self.general_discover_browser_version(
            r#"HKCU\Software\Microsoft\Edge\BLBeacon"#,
            REG_VERSION_ARG,
            DASH_DASH_VERSION,
        )
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Box<dyn Error>> {
        let mut major_browser_version = self.get_major_browser_version();
        let mut metadata = get_metadata(self.get_logger(), self.get_cache_path()?);

        match get_driver_version_from_metadata(
            &metadata.drivers,
            self.driver_name,
            major_browser_version.as_str(),
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

                if self.is_browser_version_stable()
                    || major_browser_version.is_empty()
                    || self.is_browser_version_unstable()
                {
                    let latest_stable_url = format!("{}{}", DRIVER_URL, LATEST_STABLE);
                    self.log.debug(format!(
                        "Reading {} latest version from {}",
                        &self.driver_name, latest_stable_url
                    ));
                    let latest_driver_version = read_version_from_link(
                        self.get_http_client(),
                        latest_stable_url,
                        self.get_logger(),
                    )?;
                    major_browser_version =
                        self.get_major_version(latest_driver_version.as_str())?;
                    self.log.debug(format!(
                        "Latest {} major version is {}",
                        &self.driver_name, major_browser_version
                    ));
                }
                let driver_url = format!(
                    "{}{}_{}_{}",
                    DRIVER_URL,
                    LATEST_RELEASE,
                    major_browser_version,
                    self.get_os().to_uppercase()
                );
                self.log.debug(format!(
                    "Reading {} version from {}",
                    &self.driver_name, driver_url
                ));
                let driver_version =
                    read_version_from_link(self.get_http_client(), driver_url, self.get_logger())?;

                let driver_ttl = self.get_ttl();
                if driver_ttl > 0 && !major_browser_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        major_browser_version.as_str(),
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
        Ok(None)
    }

    fn get_driver_url(&mut self) -> Result<String, Box<dyn Error>> {
        let driver_version = self.get_driver_version();
        let os = self.get_os();
        let arch = self.get_arch();
        let driver_label = if WINDOWS.is(os) {
            if ARM64.is(arch) {
                "arm64"
            } else if X32.is(arch) {
                "win32"
            } else {
                "win64"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mac64_m1"
            } else {
                "mac64"
            }
        } else {
            "linux64"
        };
        Ok(format!(
            "{}{}/edgedriver_{}.zip",
            DRIVER_URL, driver_version, driver_label
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
        Ok(None)
    }

    fn get_platform_label(&self) -> &str {
        let os = self.get_os();
        let arch = self.get_arch();
        if WINDOWS.is(os) {
            if ARM64.is(arch) {
                "win-arm64"
            } else if X32.is(arch) {
                "win32"
            } else {
                "win64"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mac-arm64"
            } else {
                "mac64"
            }
        } else {
            "linux64"
        }
    }

    fn request_latest_browser_version_from_online(&mut self) -> Result<String, Box<dyn Error>> {
        self.unavailable_download()
    }

    fn request_fixed_browser_version_from_online(&mut self) -> Result<String, Box<dyn Error>> {
        self.unavailable_download()
    }
}
