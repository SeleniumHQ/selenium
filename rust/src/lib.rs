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

use crate::chrome::ChromeManager;
use crate::edge::EdgeManager;
use crate::files::compose_cache_folder;
use crate::firefox::FirefoxManager;
use crate::iexplorer::IExplorerManager;
use std::fs;

use crate::config::{str_to_os, ManagerConfig};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::process::Command;

use crate::downloads::download_driver_to_tmp_folder;
use crate::files::{parse_version, uncompress, BrowserPath};
use crate::metadata::{
    create_browser_metadata, get_browser_version_from_metadata, get_metadata, write_metadata,
};

pub mod chrome;
pub mod config;
pub mod downloads;
pub mod edge;
pub mod files;
pub mod firefox;
pub mod iexplorer;
pub mod metadata;

pub const STABLE: &str = "stable";
pub const BETA: &str = "beta";
pub const DEV: &str = "dev";
pub const CANARY: &str = "canary";
pub const NIGHTLY: &str = "nightly";
pub const WMIC_COMMAND: &str = r#"wmic datafile where name='%{}:\=\\%{}' get Version /value"#;
pub const REG_QUERY: &str = r#"REG QUERY {} /v version"#;
pub const DASH_VERSION: &str = "{} -v";
pub const DASH_DASH_VERSION: &str = "{} --version";
pub const ENV_PROGRAM_FILES: &str = "PROGRAMFILES";
pub const ENV_PROGRAM_FILES_X86: &str = "PROGRAMFILES(X86)";
pub const ENV_LOCALAPPDATA: &str = "LOCALAPPDATA";
pub const FALLBACK_RETRIES: u32 = 5;

pub trait SeleniumManager {
    // ----------------------------------------------------------
    // Browser-specific functions
    // ----------------------------------------------------------

    fn get_browser_name(&self) -> &str;

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str>;

    fn discover_browser_version(&self) -> Option<String>;

    fn get_driver_name(&self) -> &str;

    fn request_driver_version(&self) -> Result<String, Box<dyn Error>>;

    fn get_driver_url(&self) -> Result<String, Box<dyn Error>>;

    fn get_driver_path_in_cache(&self) -> PathBuf;

    fn get_config(&self) -> &ManagerConfig;

    fn set_config(&mut self, config: ManagerConfig);

    // ----------------------------------------------------------
    // Shared functions
    // ----------------------------------------------------------

    fn download_driver(&self) -> Result<(), Box<dyn Error>> {
        let driver_url = Self::get_driver_url(self)?;
        let (_tmp_folder, driver_zip_file) = download_driver_to_tmp_folder(driver_url)?;
        let driver_path_in_cache = Self::get_driver_path_in_cache(self);
        uncompress(&driver_zip_file, driver_path_in_cache)
    }

    fn get_browser_path(&self) -> Option<&str> {
        let mut browser_version = self.get_browser_version();
        if browser_version.eq_ignore_ascii_case(CANARY) {
            browser_version = NIGHTLY;
        } else if browser_version.is_empty() {
            browser_version = STABLE;
        }
        self.get_browser_path_map()
            .get(&BrowserPath::new(str_to_os(self.get_os()), browser_version))
            .cloned()
    }

    fn detect_browser_version(&self, shell: &str, flag: &str, args: Vec<String>) -> Option<String> {
        let mut metadata = get_metadata();
        let browser_name = &self.get_browser_name();

        match get_browser_version_from_metadata(&metadata.browsers, browser_name) {
            Some(version) => {
                log::trace!(
                    "Browser with valid TTL. Getting {} version from metadata",
                    browser_name
                );
                Some(version)
            }
            _ => {
                log::debug!("Using shell command to find out {} version", browser_name);
                let mut browser_version = "".to_string();
                for arg in args.iter() {
                    let output = match self.run_shell_command(shell, flag, arg.to_string()) {
                        Ok(out) => out,
                        Err(_e) => continue,
                    };
                    let full_browser_version = parse_version(output).unwrap_or_default();
                    if full_browser_version.is_empty() {
                        continue;
                    }
                    log::debug!(
                        "The version of {} is {}",
                        browser_name,
                        full_browser_version
                    );
                    match self.get_major_version(&full_browser_version) {
                        Ok(v) => browser_version = v,
                        Err(_) => return None,
                    }
                    break;
                }

                metadata
                    .browsers
                    .push(create_browser_metadata(browser_name, &browser_version));
                write_metadata(&metadata);
                if !browser_version.is_empty() {
                    Some(browser_version)
                } else {
                    None
                }
            }
        }
    }

    fn discover_driver_version(&mut self) -> Result<String, String> {
        let browser_version = self.get_browser_version();
        if browser_version.is_empty() || self.is_browser_version_unstable() {
            match self.discover_browser_version() {
                Some(version) => {
                    log::debug!("Detected browser: {} {}", self.get_browser_name(), version);
                    self.set_browser_version(version);
                }
                None => {
                    if self.is_browser_version_unstable() {
                        return Err(format!("Browser version '{browser_version}' not found"));
                    } else {
                        log::debug!(
                        "The version of {} cannot be detected. Trying with latest driver version",
                        self.get_browser_name()
                        );
                    }
                }
            }
        }
        let driver_version = self
            .request_driver_version()
            .unwrap_or_else(|err| err.to_string());
        log::debug!(
            "Required driver: {} {}",
            self.get_driver_name(),
            driver_version
        );
        Ok(driver_version)
    }

    fn is_browser_version_unstable(&self) -> bool {
        let browser_version = self.get_browser_version();
        browser_version.eq_ignore_ascii_case(BETA)
            || browser_version.eq_ignore_ascii_case(DEV)
            || browser_version.eq_ignore_ascii_case(NIGHTLY)
            || browser_version.eq_ignore_ascii_case(CANARY)
    }

    fn resolve_driver(&mut self) -> Result<PathBuf, Box<dyn Error>> {
        if self.get_driver_version().is_empty() {
            let driver_version = self.discover_driver_version()?;
            self.set_driver_version(driver_version);
        }

        let driver_path = self.get_driver_path_in_cache();
        if driver_path.exists() {
            log::debug!(
                "{} {} already in the cache",
                self.get_driver_name(),
                self.get_driver_version()
            );
        } else {
            self.download_driver()?;
        }
        Ok(driver_path)
    }

    fn run_shell_command(
        &self,
        command: &str,
        flag: &str,
        args: String,
    ) -> Result<String, Box<dyn Error>> {
        log::debug!("Running {} command: {:?}", command, args);
        let output = Command::new(command).args([flag, args.as_str()]).output()?;
        log::debug!("{:?}", output);

        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    }

    fn get_major_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 0)
    }

    fn get_minor_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 1)
    }

    fn format_one_arg(&self, string: &str, arg1: &str) -> String {
        string.replacen("{}", arg1, 1)
    }

    fn format_two_args(&self, string: &str, arg1: &str, arg2: &str) -> String {
        string.replacen("{}", arg1, 1).replacen("{}", arg2, 2)
    }

    // ----------------------------------------------------------
    // Getters and setters for configuration parameters
    // ----------------------------------------------------------

    fn get_os(&self) -> &str {
        self.get_config().os.as_str()
    }

    fn set_os(&mut self, os: String) {
        let mut config = ManagerConfig::clone(self.get_config());
        config.os = os;
        self.set_config(config);
    }

    fn get_arch(&self) -> &str {
        self.get_config().arch.as_str()
    }

    fn set_arch(&mut self, arch: String) {
        let mut config = ManagerConfig::clone(self.get_config());
        config.arch = arch;
        self.set_config(config);
    }

    fn get_browser_version(&self) -> &str {
        self.get_config().browser_version.as_str()
    }

    fn set_browser_version(&mut self, browser_version: String) {
        let mut config = ManagerConfig::clone(self.get_config());
        config.browser_version = browser_version;
        self.set_config(config);
    }

    fn get_driver_version(&self) -> &str {
        self.get_config().driver_version.as_str()
    }

    fn set_driver_version(&mut self, driver_version: String) {
        let mut config = ManagerConfig::clone(self.get_config());
        config.driver_version = driver_version;
        self.set_config(config);
    }
}

// ----------------------------------------------------------
// Public functions
// ----------------------------------------------------------

pub fn get_manager_by_browser(browser_name: String) -> Result<Box<dyn SeleniumManager>, String> {
    let browser_name_lower_case = browser_name.to_ascii_lowercase();
    if browser_name_lower_case.eq("chrome") {
        Ok(ChromeManager::new())
    } else if browser_name.eq("firefox") {
        Ok(FirefoxManager::new())
    } else if vec!["edge", "msedge", "microsoftedge"].contains(&browser_name_lower_case.as_str()) {
        Ok(EdgeManager::new())
    } else if vec![
        "iexplorer",
        "ie",
        "internetexplorer",
        "internet-explorer",
        "internet_explorer",
    ]
    .contains(&browser_name_lower_case.as_str())
    {
        Ok(IExplorerManager::new())
    } else {
        Err(format!("Invalid browser name: {browser_name}"))
    }
}

pub fn get_manager_by_driver(driver_name: String) -> Result<Box<dyn SeleniumManager>, String> {
    if driver_name.eq_ignore_ascii_case("chromedriver") {
        Ok(ChromeManager::new())
    } else if driver_name.eq_ignore_ascii_case("geckodriver") {
        Ok(FirefoxManager::new())
    } else if driver_name.eq_ignore_ascii_case("msedgedriver") {
        Ok(EdgeManager::new())
    } else if driver_name.eq_ignore_ascii_case("iedriverserver") {
        Ok(IExplorerManager::new())
    } else {
        Err(format!("Invalid driver name: {driver_name}"))
    }
}

pub fn clear_cache() {
    let cache_path = compose_cache_folder();
    if cache_path.exists() {
        log::debug!("Clearing cache at: {}", cache_path.display());
        fs::remove_dir_all(&cache_path).unwrap_or_else(|err| {
            log::warn!(
                "The cache {} cannot be cleared: {}",
                cache_path.display(),
                err
            )
        });
    }
}

// ----------------------------------------------------------
// Private functions
// ----------------------------------------------------------

fn get_index_version(full_version: &str, index: usize) -> Result<String, Box<dyn Error>> {
    let version_vec: Vec<&str> = full_version.split('.').collect();
    Ok(version_vec
        .get(index)
        .ok_or(format!("Wrong version: {}", full_version))?
        .to_string())
}
