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
use crate::files::{compose_driver_path_in_cache, BrowserPath};
use crate::{
    create_http_client, parse_version, Logger, SeleniumManager, OFFLINE_REQUEST_ERR_MSG,
    REG_VERSION_ARG, STABLE, WINDOWS,
};
use anyhow::anyhow;
use anyhow::Error;
use reqwest::Client;
use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::mirror::{Assets, SeleniumRelease, MIRROR_URL};

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

pub struct IExplorerManager {
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

impl IExplorerManager {
    pub fn new() -> Result<Box<Self>, Error> {
        let browser_name = IE_NAMES[0];
        let driver_name = IEDRIVER_NAME;
        let mut config = ManagerConfig::default(browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        config.os = WINDOWS.to_str_vector().first().unwrap().to_string();
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(IExplorerManager {
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

impl SeleniumManager for IExplorerManager {
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
        HashMap::from([(
            BrowserPath::new(WINDOWS, STABLE),
            r"Internet Explorer\iexplore.exe",
        )])
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error> {
        self.general_discover_browser_version(
            r"HKEY_LOCAL_MACHINE\Software\Microsoft\Internet Explorer",
            REG_VERSION_ARG,
            "",
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

                let selenium_releases = parse_json_from_url::<Vec<SeleniumRelease>>(
                    self.get_http_client(),
                    MIRROR_URL,
                )?;

                let filtered_releases: Vec<SeleniumRelease> = selenium_releases
                    .into_iter()
                    .filter(|r| {
                        r.assets
                            .iter()
                            .any(|url| url.browser_download_url.contains(IEDRIVER_RELEASE))
                    })
                    .collect();

                if !filtered_releases.is_empty() {
                    let assets = &filtered_releases.first().unwrap().assets;
                    let driver_releases: Vec<&Assets> = assets
                        .iter()
                        .filter(|url| url.browser_download_url.contains(IEDRIVER_RELEASE))
                        .collect();
                    let driver_url = &driver_releases.last().unwrap().browser_download_url;
                    self.driver_url = Some(driver_url.to_string());

                    let index_release =
                        driver_url.rfind(IEDRIVER_RELEASE).unwrap() + IEDRIVER_RELEASE.len();
                    let driver_version = parse_version(
                        driver_url.as_str()[index_release..].to_string(),
                        self.get_logger(),
                    )?;

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
            "{}download/{}/{}{}.zip",
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            release_version,
            IEDRIVER_RELEASE,
            self.get_driver_version()
        ))
    }

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Error> {
        Ok(compose_driver_path_in_cache(
            self.get_cache_path()?.unwrap_or_default(),
            self.driver_name,
            "Windows",
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
        "win32"
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
