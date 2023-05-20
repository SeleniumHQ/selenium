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
use std::cell::RefCell;
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;

use crate::files::{compose_driver_path_in_cache, BrowserPath};

use crate::{create_http_client, parse_version, Logger, SeleniumManager};

use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::mirror::{get_mirror_response, Assets, SeleniumRelease};

pub const IE_NAMES: &[&str] = &[
    "iexplorer",
    "ie",
    "internetexplorer",
    "internet explorer",
    "internet-explorer",
    "internet_explorer",
];
pub const IEDRIVER_NAME: &str = "IEDriverServer";
const DRIVER_URL: &str = "https://github.com/SeleniumHQ/selenium/releases/";
const IEDRIVER_RELEASE: &str = "IEDriverServer_Win32_";

thread_local!(static RELEASE_URL: RefCell<String> = RefCell::new("".to_string()));

pub struct IExplorerManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
}

impl IExplorerManager {
    pub fn new() -> Result<Box<Self>, Box<dyn Error>> {
        let browser_name = IE_NAMES[0];
        let driver_name = IEDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        Ok(Box::new(IExplorerManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::default(),
        }))
    }
}

impl SeleniumManager for IExplorerManager {
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
        HashMap::new()
    }

    fn discover_browser_version(&self) -> Option<String> {
        None
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&self) -> Result<String, Box<dyn Error>> {
        let browser_version = self.get_browser_version();
        let mut metadata = get_metadata(self.get_logger());
        let driver_ttl = self.get_config().driver_ttl;

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
                let selenium_releases = get_mirror_response(self.get_http_client())?;

                let filtered_releases: Vec<SeleniumRelease> = selenium_releases
                    .into_iter()
                    .filter(|r| {
                        r.assets
                            .iter()
                            .any(|url| url.browser_download_url.contains(IEDRIVER_RELEASE))
                    })
                    .collect();

                if !filtered_releases.is_empty() {
                    let assets = &filtered_releases.get(0).unwrap().assets;
                    let driver_releases: Vec<&Assets> = assets
                        .iter()
                        .filter(|url| url.browser_download_url.contains(IEDRIVER_RELEASE))
                        .collect();
                    let driver_url = &driver_releases.last().unwrap().browser_download_url;
                    RELEASE_URL.with(|url| {
                        *url.borrow_mut() = driver_url.to_string();
                    });

                    let index_release =
                        driver_url.rfind(IEDRIVER_RELEASE).unwrap() + IEDRIVER_RELEASE.len();
                    let driver_version = parse_version(
                        driver_url.as_str()[index_release..].to_string(),
                        self.get_logger(),
                    )?;

                    if !browser_version.is_empty() {
                        metadata.drivers.push(create_driver_metadata(
                            browser_version,
                            self.driver_name,
                            &driver_version,
                            driver_ttl,
                        ));
                        write_metadata(&metadata, self.get_logger());
                    }

                    Ok(driver_version)
                } else {
                    Err(format!("{} release not available", self.get_driver_name()).into())
                }
            }
        }
    }

    fn get_driver_url(&self) -> Result<String, Box<dyn Error>> {
        let mut driver_url = "".to_string();
        RELEASE_URL.with(|url| {
            driver_url = url.borrow().to_string();
        });
        if driver_url.is_empty() {
            let driver_version = self.get_driver_version();
            let mut release_version = driver_version.to_string();
            if !driver_version.ends_with('0') {
                // E.g.: version 4.8.1 is shipped within release 4.8.0
                let error_message = format!(
                    "Wrong {} version: '{}'",
                    self.get_driver_name(),
                    driver_version
                );
                let index = release_version.rfind('.').ok_or(error_message)? + 1;
                release_version = release_version[..index].to_string();
                release_version.push('0');
            }
            driver_url = format!(
                "{}download/selenium-{}/{}{}.zip",
                DRIVER_URL, release_version, IEDRIVER_RELEASE, driver_version
            );
        }
        Ok(driver_url)
    }

    fn get_driver_path_in_cache(&self) -> PathBuf {
        let driver_version = self.get_driver_version();
        let _minor_driver_version = self
            .get_minor_version(driver_version)
            .unwrap_or_default()
            .parse::<i32>()
            .unwrap_or_default();
        compose_driver_path_in_cache(self.driver_name, "Windows", "win32", driver_version)
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
