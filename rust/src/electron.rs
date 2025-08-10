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

use crate::chrome::CHROMEDRIVER_NAME;
use crate::config::ManagerConfig;
use crate::config::ARCH::{ARM64, X32};
use crate::config::OS::MACOS;
use crate::downloads::read_redirect_from_link;
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_http_client, Logger, SeleniumManager, LATEST_RELEASE, OFFLINE_REQUEST_ERR_MSG, WINDOWS,
};
use anyhow::Error;
use reqwest::Client;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

pub const ELECTRON_NAME: &str = "electron";
const DRIVER_URL: &str = "https://github.com/electron/electron/releases/";

pub struct ElectronManager {
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

impl ElectronManager {
    pub fn new() -> Result<Box<Self>, Error> {
        let browser_name = ELECTRON_NAME;
        let driver_name = CHROMEDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(ElectronManager {
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

impl SeleniumManager for ElectronManager {
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

                let latest_url = format!(
                    "{}{}",
                    self.get_driver_mirror_url_or_default(DRIVER_URL),
                    LATEST_RELEASE
                );
                let driver_version =
                    read_redirect_from_link(self.get_http_client(), latest_url, self.get_logger())?;
                let driver_ttl = self.get_ttl();
                if driver_ttl > 0 {
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
        Ok(None)
    }

    fn get_driver_url(&mut self) -> Result<String, Error> {
        if self.driver_url.is_some() {
            return Ok(self.driver_url.as_ref().unwrap().to_string());
        }

        Ok(format!(
            "{}download/v{}/{}-v{}-{}.zip",
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            self.get_driver_version(),
            CHROMEDRIVER_NAME,
            self.get_driver_version(),
            self.get_platform_label()
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
                "win32-ia32"
            } else if ARM64.is(arch) {
                "win32-arm64-x64"
            } else {
                "win32-x64"
            }
        } else if MACOS.is(os) {
            if ARM64.is(arch) {
                "mas-arm64"
            } else {
                "mas-x64"
            }
        } else if ARM64.is(arch) {
            "linux-arm64"
        } else {
            "linux-x64"
        }
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
