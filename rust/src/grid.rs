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
use crate::downloads::parse_json_from_url;
use crate::files::BrowserPath;
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::mirror::{Assets, SeleniumRelease, MIRROR_URL};
use crate::{
    create_http_client, parse_version, Logger, SeleniumManager, OFFLINE_REQUEST_ERR_MSG, SNAPSHOT,
};
use anyhow::anyhow;
use anyhow::Error;
use reqwest::Client;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

pub const GRID_NAME: &str = "grid";
const GRID_RELEASE: &str = "selenium-server";
const GRID_EXTENSION: &str = "jar";
const DRIVER_URL: &str = "https://github.com/SeleniumHQ/selenium/releases/";

// Although Selenium Grid is not a browser, we can use the same manager struct, where:
// - browser_name refers to the product name, i.e., grid
// - driver_name refers to the downloadable artifact, i.e., selenium-server (.jar)
pub struct GridManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
    pub tx: Sender<String>,
    pub rx: Receiver<String>,
    pub download_browser: bool,
    pub driver_url: Option<String>,
}

impl GridManager {
    pub fn new(driver_version: String) -> Result<Box<Self>, Error> {
        let browser_name = GRID_NAME;
        let driver_name = GRID_RELEASE;
        let mut config = ManagerConfig::default(browser_name, driver_name);
        config.driver_version = driver_version;
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(GridManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
            tx,
            rx,
            download_browser: false,
            driver_url: None,
        }))
    }
}

impl SeleniumManager for GridManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_names_in_path(&self) -> Vec<&str> {
        vec![self.get_browser_name()]
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

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error> {
        Ok(None)
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Error> {
        let is_nightly = self.is_nightly(self.get_driver_version());
        let major_driver_version_binding = self.get_major_driver_version();
        let major_driver_version = major_driver_version_binding.as_str();
        let cache_path = self.get_cache_path()?;
        let mut metadata = get_metadata(self.get_logger(), &cache_path);

        match get_driver_version_from_metadata(
            &metadata.drivers,
            self.driver_name,
            major_driver_version,
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

                let selenium_releases = parse_json_from_url::<Vec<SeleniumRelease>>(
                    self.get_http_client(),
                    MIRROR_URL,
                )?;

                let filtered_releases: Vec<SeleniumRelease> = selenium_releases
                    .into_iter()
                    .filter(|r| {
                        r.assets.iter().any(|url| {
                            if is_nightly {
                                url.browser_download_url.contains(SNAPSHOT)
                            } else {
                                url.browser_download_url.contains(GRID_RELEASE)
                                    && !url.browser_download_url.contains(SNAPSHOT)
                            }
                        })
                    })
                    .collect();

                if !filtered_releases.is_empty() {
                    let assets = &filtered_releases.first().unwrap().assets;
                    let driver_releases: Vec<&Assets> = assets
                        .iter()
                        .filter(|url| {
                            url.browser_download_url.contains(GRID_RELEASE)
                                && url.browser_download_url.contains(GRID_EXTENSION)
                        })
                        .collect();
                    let driver_url = &driver_releases.last().unwrap().browser_download_url;
                    self.driver_url = Some(driver_url.to_string());

                    let index_release =
                        driver_url.rfind(GRID_RELEASE).unwrap() + GRID_RELEASE.len() + 1;
                    let driver_version = if is_nightly {
                        let index_jar = driver_url.rfind(GRID_EXTENSION).unwrap() - 1;
                        driver_url.as_str()[index_release..index_jar].to_string()
                    } else {
                        parse_version(
                            driver_url.as_str()[index_release..].to_string(),
                            self.get_logger(),
                        )?
                    };

                    let driver_ttl = self.get_ttl();
                    if driver_ttl > 0 {
                        metadata.drivers.push(create_driver_metadata(
                            major_driver_version,
                            self.driver_name,
                            &driver_version,
                            driver_ttl,
                        ));
                        write_metadata(&metadata, self.get_logger(), cache_path);
                    }

                    Ok(driver_version)
                } else {
                    Err(anyhow!(format!(
                        "{} release not available",
                        self.get_driver_name()
                    )))
                }
            }
        }
    }

    fn request_browser_version(&mut self) -> Result<Option<String>, Error> {
        Ok(None)
    }

    fn get_driver_url(&mut self) -> Result<String, Error> {
        if self.driver_url.is_some() {
            return Ok(self.driver_url.as_ref().unwrap().to_string());
        }

        let release_version = self.get_selenium_release_version()?;
        Ok(format!(
            "{}download/{}/{}-{}.{}",
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            release_version,
            GRID_RELEASE,
            self.get_driver_version(),
            GRID_EXTENSION
        ))
    }

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Error> {
        let browser_name = self.get_browser_name();
        let driver_name = self.get_driver_name();
        let driver_version = self.get_driver_version();
        Ok(self
            .get_cache_path()?
            .unwrap_or_default()
            .join(browser_name)
            .join(driver_version)
            .join(format!("{driver_name}-{driver_version}.{GRID_EXTENSION}")))
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
        ""
    }

    fn request_latest_browser_version_from_online(
        &mut self,
        _browser_version: &str,
    ) -> Result<String, Error> {
        self.unavailable_download()
    }

    fn request_fixed_browser_version_from_online(
        &mut self,
        _browser_version: &str,
    ) -> Result<String, Error> {
        self.unavailable_download()
    }

    fn get_min_browser_version_for_download(&self) -> Result<i32, Error> {
        self.unavailable_download()
    }

    fn get_browser_binary_path(&mut self, _browser_version: &str) -> Result<PathBuf, Error> {
        self.unavailable_download()
    }

    fn get_browser_url_for_download(&mut self, _browser_version: &str) -> Result<String, Error> {
        self.unavailable_download()
    }

    fn get_browser_label_for_download(
        &self,
        _browser_version: &str,
    ) -> Result<Option<&str>, Error> {
        self.unavailable_download()
    }

    fn is_download_browser(&self) -> bool {
        self.download_browser
    }

    fn set_download_browser(&mut self, download_browser: bool) {
        self.download_browser = download_browser;
    }

    fn is_snap(&self, _browser_path: &str) -> bool {
        false
    }

    fn get_snap_path(&self) -> Option<PathBuf> {
        None
    }
}
