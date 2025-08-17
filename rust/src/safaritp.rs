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
use crate::config::OS::MACOS;
use crate::files::BrowserPath;
use crate::{create_http_client, Logger, SeleniumManager, STABLE};
use anyhow::anyhow;
use anyhow::Error;
use reqwest::Client;
use std::collections::HashMap;
use std::path::PathBuf;
use std::string::ToString;
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

pub const SAFARITP_NAMES: &[&str] = &[
    "safaritp",
    "safari technology preview",
    r"safari\ technology\ preview",
    "safaritechnologypreview",
];
pub const SAFARITPDRIVER_NAME: &str = "safaridriver";
const SAFARITP_PATH: &str = "/Applications/Safari Technology Preview.app";
const SAFARITP_FULL_PATH: &str =
    "/Applications/Safari Technology Preview.app/Contents/MacOS/Safari Technology Preview";

pub struct SafariTPManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
    pub tx: Sender<String>,
    pub rx: Receiver<String>,
    pub download_browser: bool,
}

impl SafariTPManager {
    pub fn new() -> Result<Box<Self>, Error> {
        let browser_name = SAFARITP_NAMES[0];
        let driver_name = SAFARITPDRIVER_NAME;
        let config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(SafariTPManager {
            browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
            tx,
            rx,
            download_browser: false,
        }))
    }
}

impl SeleniumManager for SafariTPManager {
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
        HashMap::from([(BrowserPath::new(MACOS, STABLE), SAFARITP_PATH)])
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error> {
        self.discover_safari_version(SAFARITP_FULL_PATH.to_string())
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Error> {
        Ok("(local)".to_string())
    }

    fn request_browser_version(&mut self) -> Result<Option<String>, Error> {
        Ok(None)
    }

    fn get_driver_url(&mut self) -> Result<String, Error> {
        Err(anyhow!(format!(
            "{} not available for download",
            self.get_driver_name()
        )))
    }

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Error> {
        Ok(PathBuf::from(
            "/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver",
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
