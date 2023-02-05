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

use crate::config::OS::WINDOWS;
use crate::config::{str_to_os, ManagerConfig};
use reqwest::{Client, ClientBuilder, Proxy};
use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;
use std::process::Command;
use std::time::Duration;

use crate::downloads::download_driver_to_tmp_folder;
use crate::files::{parse_version, uncompress, BrowserPath};
use crate::logger::Logger;
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
pub mod logger;
pub mod metadata;

pub const REQUEST_TIMEOUT_SEC: u64 = 120; // The timeout is applied from when the request starts connecting until the response body has finished
pub const STABLE: &str = "stable";
pub const BETA: &str = "beta";
pub const DEV: &str = "dev";
pub const CANARY: &str = "canary";
pub const NIGHTLY: &str = "nightly";
pub const WMIC_COMMAND: &str = r#"wmic datafile where name='{}' get Version /value"#;
pub const WMIC_COMMAND_ENV: &str = r#"wmic datafile where name='%{}:\=\\%{}' get Version /value"#;
pub const REG_QUERY: &str = r#"REG QUERY {} /v version"#;
pub const DASH_VERSION: &str = "{} -v";
pub const DASH_DASH_VERSION: &str = "{} --version";
pub const ENV_PROGRAM_FILES: &str = "PROGRAMFILES";
pub const ENV_PROGRAM_FILES_X86: &str = "PROGRAMFILES(X86)";
pub const ENV_LOCALAPPDATA: &str = "LOCALAPPDATA";
pub const FALLBACK_RETRIES: u32 = 5;
pub const WHERE_COMMAND: &str = "where {}";
pub const WHICH_COMMAND: &str = "which {}";

pub trait SeleniumManager {
    // ----------------------------------------------------------
    // Browser-specific functions
    // ----------------------------------------------------------

    fn get_browser_name(&self) -> &str;

    fn get_http_client(&self) -> &Client;

    fn set_http_client(&mut self, http_client: Client);

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str>;

    fn discover_browser_version(&self) -> Option<String>;

    fn get_driver_name(&self) -> &str;

    fn request_driver_version(&self) -> Result<String, Box<dyn Error>>;

    fn get_driver_url(&self) -> Result<String, Box<dyn Error>>;

    fn get_driver_path_in_cache(&self) -> PathBuf;

    fn get_config(&self) -> &ManagerConfig;

    fn set_config(&mut self, config: ManagerConfig);

    fn get_logger(&self) -> &Logger;

    fn set_logger(&mut self, log: Logger);

    // ----------------------------------------------------------
    // Shared functions
    // ----------------------------------------------------------

    fn download_driver(&self) -> Result<(), Box<dyn Error>> {
        let driver_url = Self::get_driver_url(self)?;
        self.get_logger()
            .debug(format!("Driver URL: {}", driver_url));
        let (_tmp_folder, driver_zip_file) =
            download_driver_to_tmp_folder(self.get_http_client(), driver_url, self.get_logger())?;
        let driver_path_in_cache = Self::get_driver_path_in_cache(self);
        uncompress(&driver_zip_file, driver_path_in_cache, self.get_logger())
    }

    fn detect_browser_path(&self) -> Option<&str> {
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

    fn detect_browser_version(&self, commands: Vec<String>) -> Option<String> {
        let mut metadata = get_metadata(self.get_logger());
        let browser_name = &self.get_browser_name();

        match get_browser_version_from_metadata(&metadata.browsers, browser_name) {
            Some(version) => {
                self.get_logger().trace(format!(
                    "Browser with valid TTL. Getting {} version from metadata",
                    browser_name
                ));
                Some(version)
            }
            _ => {
                self.get_logger().debug(format!(
                    "Using shell command to find out {} version",
                    browser_name
                ));
                let mut browser_version = "".to_string();
                for command in commands.iter() {
                    let output = match self.run_shell_command_with_log(command.to_string()) {
                        Ok(out) => out,
                        Err(_e) => continue,
                    };
                    let full_browser_version = parse_version(output).unwrap_or_default();
                    if full_browser_version.is_empty() {
                        continue;
                    }
                    self.get_logger().debug(format!(
                        "The version of {} is {}",
                        browser_name, full_browser_version
                    ));
                    match self.get_major_version(&full_browser_version) {
                        Ok(v) => browser_version = v,
                        Err(_) => return None,
                    }
                    break;
                }

                metadata
                    .browsers
                    .push(create_browser_metadata(browser_name, &browser_version));
                write_metadata(&metadata, self.get_logger());
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
                    self.get_logger().debug(format!(
                        "Detected browser: {} {}",
                        self.get_browser_name(),
                        version
                    ));
                    self.set_browser_version(version);
                }
                None => {
                    if self.is_browser_version_unstable() {
                        return Err(format!("Browser version '{browser_version}' not found"));
                    } else {
                        self.get_logger().debug(format!(
                        "The version of {} cannot be detected. Trying with latest driver version",
                        self.get_browser_name()
                        ));
                    }
                }
            }
        }
        let driver_version = match self.request_driver_version() {
            Ok(version) => {
                if version.is_empty() {
                    return Err(format!(
                        "The {} version cannot be discovered",
                        self.get_driver_name()
                    ));
                }
                version
            }
            Err(err) => {
                return Err(err.to_string());
            }
        };
        self.get_logger().debug(format!(
            "Required driver: {} {}",
            self.get_driver_name(),
            driver_version
        ));
        Ok(driver_version)
    }

    fn find_driver_in_path(&self) -> (Option<String>, Option<String>) {
        match self
            .run_shell_command_with_log(format_one_arg(DASH_DASH_VERSION, self.get_driver_name()))
        {
            Ok(output) => {
                let parsed_version = parse_version(output).unwrap_or_default();
                if !parsed_version.is_empty() {
                    let which_command = if WINDOWS.is(self.get_os()) {
                        WHERE_COMMAND
                    } else {
                        WHICH_COMMAND
                    };
                    let driver_path = match self.run_shell_command_with_log(format_one_arg(
                        which_command,
                        self.get_driver_name(),
                    )) {
                        Ok(path) => Some(path),
                        Err(_) => None,
                    };
                    return (Some(parsed_version), driver_path);
                }
                (None, None)
            }
            Err(_) => (None, None),
        }
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

        let (in_path_driver_version, in_path_driver_path) = self.find_driver_in_path();
        if let (Some(found_driver_version), Some(found_driver_path)) =
            (in_path_driver_version, in_path_driver_path)
        {
            if found_driver_version.eq(self.get_driver_version()) {
                self.get_logger().debug(format!(
                    "Found {} {} in PATH: {}",
                    self.get_driver_name(),
                    found_driver_version,
                    found_driver_path
                ));
                return Ok(PathBuf::from(found_driver_path));
            } else {
                self.get_logger().warn(format!(
                    "Incompatible release of {} (version {}) detected in PATH: {}",
                    self.get_driver_name(),
                    found_driver_version,
                    found_driver_path
                ));
            }
        }
        let driver_path = self.get_driver_path_in_cache();
        if driver_path.exists() {
            self.get_logger().debug(format!(
                "{} {} already in the cache",
                self.get_driver_name(),
                self.get_driver_version()
            ));
        } else {
            self.download_driver()?;
        }
        Ok(driver_path)
    }

    fn run_shell_command_with_log(&self, command: String) -> Result<String, Box<dyn Error>> {
        self.get_logger()
            .debug(format!("Running command: {:?}", command));
        let output = run_shell_command(self.get_os(), command)?;
        self.get_logger().debug(format!("Output: {:?}", output));
        Ok(output)
    }

    fn get_major_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 0)
    }

    fn get_minor_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 1)
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

    fn get_browser_path(&self) -> &str {
        self.get_config().browser_path.as_str()
    }

    fn set_browser_path(&mut self, browser_path: String) {
        let mut config = ManagerConfig::clone(self.get_config());
        config.browser_path = browser_path;
        self.set_config(config);
    }

    fn get_proxy(&self) -> &str {
        self.get_config().proxy.as_str()
    }

    fn set_proxy(&mut self, proxy: String) -> Result<(), Box<dyn Error>> {
        let mut config = ManagerConfig::clone(self.get_config());
        config.proxy = proxy.to_string();
        self.set_config(config);

        if !proxy.is_empty() {
            self.get_logger().debug(format!("Using proxy: {}", &proxy));
            self.update_http_proxy()?;
        }
        Ok(())
    }

    fn get_timeout(&self) -> u64 {
        self.get_config().timeout
    }

    fn set_timeout(&mut self, timeout: u64) -> Result<(), Box<dyn Error>> {
        let mut config = ManagerConfig::clone(self.get_config());
        config.timeout = timeout;
        self.set_config(config);

        if timeout != REQUEST_TIMEOUT_SEC {
            self.get_logger()
                .debug(format!("Using timeout of {} seconds", timeout));
            self.update_http_proxy()?;
        }
        Ok(())
    }

    fn update_http_proxy(&mut self) -> Result<(), Box<dyn Error>> {
        let proxy = self.get_proxy();
        let timeout = self.get_timeout();

        let mut builder = http_client_builder().timeout(Duration::from_secs(timeout));
        if !proxy.is_empty() {
            builder = builder.proxy(Proxy::all(proxy)?);
        }
        let http_client = builder.build()?;
        self.set_http_client(http_client);
        Ok(())
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

pub fn clear_cache(log: &Logger) {
    let cache_path = compose_cache_folder();
    if cache_path.exists() {
        log.debug(format!("Clearing cache at: {}", cache_path.display()));
        fs::remove_dir_all(&cache_path).unwrap_or_else(|err| {
            log.warn(format!(
                "The cache {} cannot be cleared: {}",
                cache_path.display(),
                err
            ))
        });
    }
}

pub fn create_default_http_client() -> Client {
    http_client_builder()
        .timeout(Duration::from_secs(REQUEST_TIMEOUT_SEC))
        .build()
        .unwrap_or_default()
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

pub fn http_client_builder() -> ClientBuilder {
    Client::builder()
        .danger_accept_invalid_certs(true)
        .use_rustls_tls()
}

fn strip_trailing_newline(input: &str) -> &str {
    input
        .strip_suffix("\r\n")
        .or_else(|| input.strip_suffix('\n'))
        .unwrap_or(input)
}

pub fn run_shell_command(os: &str, command: String) -> Result<String, Box<dyn Error>> {
    let (shell, flag) = if WINDOWS.is(os) {
        ("cmd", "/C")
    } else {
        ("sh", "-c")
    };
    let output = Command::new(shell)
        .args([flag, command.as_str()])
        .output()?;
    Ok(
        strip_trailing_newline(String::from_utf8_lossy(&output.stdout).to_string().as_str())
            .to_string(),
    )
}

pub fn format_one_arg(string: &str, arg1: &str) -> String {
    string.replacen("{}", arg1, 1)
}

pub fn format_two_args(string: &str, arg1: &str, arg2: &str) -> String {
    string.replacen("{}", arg1, 1).replacen("{}", arg2, 2)
}
