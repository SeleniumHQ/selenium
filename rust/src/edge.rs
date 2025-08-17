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
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};
use crate::{
    create_http_client, get_binary_extension, path_to_string, Logger, SeleniumManager, BETA,
    DASH_DASH_VERSION, DEV, ENV_PROGRAM_FILES_X86, NIGHTLY, OFFLINE_REQUEST_ERR_MSG, REG_PV_ARG,
    REG_VERSION_ARG, STABLE,
};
use anyhow::Error;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::env;
use std::path::{Path, PathBuf};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

pub const EDGE_NAMES: &[&str] = &[
    "edge",
    EDGE_WINDOWS_AND_LINUX_APP_NAME,
    "microsoftedge",
    WEBVIEW2_NAME,
];
pub const EDGEDRIVER_NAME: &str = "msedgedriver";
pub const WEBVIEW2_NAME: &str = "webview2";
const DRIVER_URL: &str = "https://msedgedriver.microsoft.com/";
const LATEST_STABLE: &str = "LATEST_STABLE";
const LATEST_RELEASE: &str = "LATEST_RELEASE";
const BROWSER_URL: &str = "https://edgeupdates.microsoft.com/api/products/";
const MIN_EDGE_VERSION_DOWNLOAD: i32 = 113;
const EDGE_WINDOWS_AND_LINUX_APP_NAME: &str = "msedge";
const EDGE_MACOS_APP_NAME: &str = "Microsoft Edge.app/Contents/MacOS/Microsoft Edge";
const EDGE_BETA_MACOS_APP_NAME: &str = "Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta";
const EDGE_DEV_MACOS_APP_NAME: &str = "Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev";
const EDGE_CANARY_MACOS_APP_NAME: &str =
    "Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary";

pub struct EdgeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
    pub config: ManagerConfig,
    pub http_client: Client,
    pub log: Logger,
    pub tx: Sender<String>,
    pub rx: Receiver<String>,
    pub download_browser: bool,
    pub browser_url: Option<String>,
}

impl EdgeManager {
    pub fn new() -> Result<Box<Self>, Error> {
        Self::new_with_name(EDGE_NAMES[0].to_string())
    }

    pub fn new_with_name(browser_name: String) -> Result<Box<Self>, Error> {
        let static_browser_name: &str = Box::leak(browser_name.into_boxed_str());
        let driver_name = EDGEDRIVER_NAME;
        let config = ManagerConfig::default(static_browser_name, driver_name);
        let default_timeout = config.timeout.to_owned();
        let default_proxy = &config.proxy;
        let (tx, rx): (Sender<String>, Receiver<String>) = mpsc::channel();
        Ok(Box::new(EdgeManager {
            browser_name: static_browser_name,
            driver_name,
            http_client: create_http_client(default_timeout, default_proxy)?,
            config,
            log: Logger::new(),
            tx,
            rx,
            download_browser: false,
            browser_url: None,
        }))
    }
}

impl SeleniumManager for EdgeManager {
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
        if self.is_webview2() {
            HashMap::from([(
                BrowserPath::new(WINDOWS, STABLE),
                r"Microsoft\EdgeWebView\Application",
            )])
        } else {
            HashMap::from([
                (
                    BrowserPath::new(WINDOWS, STABLE),
                    r"Microsoft\Edge\Application\msedge.exe",
                ),
                (
                    BrowserPath::new(WINDOWS, BETA),
                    r"Microsoft\Edge Beta\Application\msedge.exe",
                ),
                (
                    BrowserPath::new(WINDOWS, DEV),
                    r"Microsoft\Edge Dev\Application\msedge.exe",
                ),
                (
                    BrowserPath::new(WINDOWS, NIGHTLY),
                    r"Microsoft\Edge SxS\Application\msedge.exe",
                ),
                (
                    BrowserPath::new(MACOS, STABLE),
                    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
                ),
                (
                    BrowserPath::new(MACOS, BETA),
                    "/Applications/Microsoft Edge Beta.app/Contents/MacOS/Microsoft Edge Beta",
                ),
                (
                    BrowserPath::new(MACOS, DEV),
                    "/Applications/Microsoft Edge Dev.app/Contents/MacOS/Microsoft Edge Dev",
                ),
                (
                    BrowserPath::new(MACOS, NIGHTLY),
                    "/Applications/Microsoft Edge Canary.app/Contents/MacOS/Microsoft Edge Canary",
                ),
                (BrowserPath::new(LINUX, STABLE), "/usr/bin/microsoft-edge"),
                (
                    BrowserPath::new(LINUX, BETA),
                    "/usr/bin/microsoft-edge-beta",
                ),
                (BrowserPath::new(LINUX, DEV), "/usr/bin/microsoft-edge-dev"),
            ])
        }
    }

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error> {
        let (reg_key, reg_version_arg, cmd_version_arg) = if self.is_webview2() {
            let arch = self.get_arch();
            if X32.is(arch) {
                (
                    r"HKLM\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
                    REG_PV_ARG,
                    "",
                )
            } else {
                (
                    r"HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
                    REG_PV_ARG,
                    "",
                )
            }
        } else {
            (
                r"HKCU\Software\Microsoft\Edge\BLBeacon",
                REG_VERSION_ARG,
                DASH_DASH_VERSION,
            )
        };
        self.general_discover_browser_version(reg_key, reg_version_arg, cmd_version_arg)
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn request_driver_version(&mut self) -> Result<String, Error> {
        let mut major_browser_version = self.get_major_browser_version();
        let cache_path = self.get_cache_path()?;
        let mut metadata = get_metadata(self.get_logger(), &cache_path);

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
                    let latest_stable_url = format!(
                        "{}{}",
                        self.get_driver_mirror_url_or_default(DRIVER_URL),
                        LATEST_STABLE
                    );
                    self.log.debug(format!(
                        "Reading {} latest version from {}",
                        &self.driver_name, latest_stable_url
                    ));
                    let latest_driver_version = read_version_from_link(
                        self.get_http_client(),
                        &latest_stable_url,
                        self.get_logger(),
                    )?;
                    major_browser_version = self.get_major_version(&latest_driver_version)?;
                    self.log.debug(format!(
                        "Latest {} major version is {}",
                        &self.driver_name, major_browser_version
                    ));
                }
                let driver_url = format!(
                    "{}{}_{}_{}",
                    self.get_driver_mirror_url_or_default(DRIVER_URL),
                    LATEST_RELEASE,
                    major_browser_version,
                    self.get_os().to_uppercase()
                );
                self.log.debug(format!(
                    "Reading {} version from {}",
                    &self.driver_name, driver_url
                ));
                let driver_version =
                    read_version_from_link(self.get_http_client(), &driver_url, self.get_logger())?;

                let driver_ttl = self.get_ttl();
                if driver_ttl > 0 && !major_browser_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        major_browser_version.as_str(),
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
            self.get_driver_mirror_url_or_default(DRIVER_URL),
            driver_version,
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

    fn request_latest_browser_version_from_online(
        &mut self,
        browser_version: &str,
    ) -> Result<String, Error> {
        let browser_name = self.browser_name;
        let is_fixed_browser_version = !self.is_empty(browser_version)
            && !self.is_stable(browser_version)
            && !self.is_unstable(browser_version);
        let browser_url = self.get_browser_mirror_url_or_default(BROWSER_URL);
        let edge_updates_url = if is_fixed_browser_version {
            format!("{}?view=enterprise", browser_url)
        } else {
            browser_url
        };
        self.get_logger().debug(format!(
            "Checking {} releases on {}",
            browser_name, edge_updates_url
        ));

        let edge_products =
            parse_json_from_url::<Vec<EdgeProduct>>(self.get_http_client(), &edge_updates_url)?;

        let edge_channel = if self.is_beta(browser_version) {
            "Beta"
        } else if self.is_dev(browser_version) {
            "Dev"
        } else if self.is_nightly(browser_version) {
            "Canary"
        } else {
            "Stable"
        };
        let products: Vec<&EdgeProduct> = edge_products
            .iter()
            .filter(|p| p.product.eq_ignore_ascii_case(edge_channel))
            .collect();
        self.get_logger().trace(format!("Products: {:?}", products));

        let os = self.get_os();
        let arch = self.get_arch();
        let os_label;
        let arch_label = if WINDOWS.is(os) {
            os_label = "Windows";
            if ARM64.is(arch) {
                "arm64"
            } else if X32.is(arch) {
                "x86"
            } else {
                "x64"
            }
        } else if MACOS.is(os) {
            os_label = "MacOS";
            "universal"
        } else {
            os_label = "Linux";
            "x64"
        };
        if products.is_empty() {
            return self.unavailable_discovery();
        }

        let releases: Vec<&Release> = products
            .first()
            .unwrap()
            .releases
            .iter()
            .filter(|r| {
                let os_arch = r.platform.eq_ignore_ascii_case(os_label)
                    && r.architecture.eq_ignore_ascii_case(arch_label);
                if is_fixed_browser_version {
                    os_arch && r.product_version.starts_with(browser_version)
                } else {
                    os_arch
                }
            })
            .collect();
        self.get_logger().trace(format!("Releases: {:?}", releases));

        let package_label = if WINDOWS.is(os) {
            "msi"
        } else if MACOS.is(os) {
            "pkg"
        } else {
            "deb"
        };
        if releases.is_empty() {
            return self.unavailable_discovery();
        }

        let releases_with_artifacts: Vec<&Release> = releases
            .into_iter()
            .filter(|r| !r.artifacts.is_empty())
            .collect();
        if releases_with_artifacts.is_empty() {
            return self.unavailable_discovery();
        }

        let release = releases_with_artifacts.first().unwrap();
        let artifacts: Vec<&Artifact> = release
            .artifacts
            .iter()
            .filter(|a| a.artifact_name.eq_ignore_ascii_case(package_label))
            .collect();
        self.get_logger()
            .trace(format!("Artifacts: {:?}", artifacts));

        if artifacts.is_empty() {
            return self.unavailable_discovery();
        }
        let artifact = artifacts.first().unwrap();
        let browser_version = release.product_version.clone();
        self.browser_url = Some(artifact.location.clone());

        Ok(browser_version)
    }

    fn request_fixed_browser_version_from_online(
        &mut self,
        browser_version: &str,
    ) -> Result<String, Error> {
        self.request_latest_browser_version_from_online(browser_version)
    }

    fn get_min_browser_version_for_download(&self) -> Result<i32, Error> {
        Ok(MIN_EDGE_VERSION_DOWNLOAD)
    }

    fn get_browser_binary_path(&mut self, browser_version: &str) -> Result<PathBuf, Error> {
        let browser_in_cache = self.get_browser_path_in_cache()?;
        if MACOS.is(self.get_os()) {
            let macos_app_name = if self.is_beta(browser_version) {
                EDGE_BETA_MACOS_APP_NAME
            } else if self.is_dev(browser_version) {
                EDGE_DEV_MACOS_APP_NAME
            } else if self.is_nightly(browser_version) {
                EDGE_CANARY_MACOS_APP_NAME
            } else {
                EDGE_MACOS_APP_NAME
            };
            Ok(browser_in_cache.join(macos_app_name))
        } else if WINDOWS.is(self.get_os()) {
            let browser_path = if self.is_unstable(browser_version) {
                self.get_browser_path_from_version(browser_version)
                    .to_string()
            } else {
                format!(
                    r"Microsoft\Edge\Application\{}\msedge.exe",
                    self.get_browser_version()
                )
            };
            let mut full_browser_path = Path::new(&browser_path).to_path_buf();
            if WINDOWS.is(self.get_os()) {
                let env_value = env::var(ENV_PROGRAM_FILES_X86).unwrap_or_default();
                let parent_path = Path::new(&env_value);
                full_browser_path = parent_path.join(&browser_path);
            }
            Ok((&path_to_string(&full_browser_path)).into())
        } else {
            Ok(browser_in_cache.join(format!(
                "{}{}",
                EDGE_WINDOWS_AND_LINUX_APP_NAME,
                get_binary_extension(self.get_os())
            )))
        }
    }

    fn get_browser_url_for_download(&mut self, browser_version: &str) -> Result<String, Error> {
        if self.browser_url.is_none() {
            self.request_latest_browser_version_from_online(browser_version)?;
        }
        Ok(self.browser_url.clone().unwrap())
    }

    fn get_browser_label_for_download(&self, browser_version: &str) -> Result<Option<&str>, Error> {
        let browser_label = if self.is_beta(browser_version) {
            "msedge-beta"
        } else if self.is_dev(browser_version) {
            "msedge-dev"
        } else if self.is_nightly(browser_version) {
            "msedge-canary"
        } else {
            "msedge"
        };
        Ok(Some(browser_label))
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

#[derive(Serialize, Deserialize, Debug)]
pub struct EdgeProduct {
    #[serde(rename = "Product", alias = "product")]
    pub product: String,
    #[serde(rename = "Releases", alias = "releases")]
    pub releases: Vec<Release>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Release {
    #[serde(rename = "ReleaseId", alias = "releaseId")]
    pub release_id: u32,
    #[serde(rename = "Platform", alias = "platform")]
    pub platform: String,
    #[serde(rename = "Architecture", alias = "architecture")]
    pub architecture: String,
    #[serde(rename = "CVEs", alias = "cves")]
    pub cves: Vec<String>,
    #[serde(rename = "ProductVersion", alias = "productVersion")]
    pub product_version: String,
    #[serde(rename = "Artifacts", alias = "artifacts")]
    pub artifacts: Vec<Artifact>,
    #[serde(rename = "PublishedTime", alias = "publishedTime")]
    pub published_time: String,
    #[serde(rename = "ExpectedExpiryDate", alias = "expectedExpiryDate")]
    pub expected_expiry_date: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Artifact {
    #[serde(rename = "ArtifactName", alias = "artifactName")]
    pub artifact_name: String,
    #[serde(rename = "Location", alias = "location")]
    pub location: String,
    #[serde(rename = "Hash", alias = "hash")]
    pub hash: String,
    #[serde(rename = "HashAlgorithm", alias = "hashAlgorithm")]
    pub hash_algorithm: String,
    #[serde(rename = "SizeInBytes", alias = "sizeInBytes")]
    pub size_in_bytes: u32,
}
