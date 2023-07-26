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

use crate::chrome::{ChromeManager, CHROMEDRIVER_NAME, CHROME_NAME};
use crate::edge::{EdgeManager, EDGEDRIVER_NAME, EDGE_NAMES};
use crate::files::{compose_cache_folder, create_parent_path_if_not_exists, get_binary_extension};
use crate::firefox::{FirefoxManager, FIREFOX_NAME, GECKODRIVER_NAME};
use crate::iexplorer::{IExplorerManager, IEDRIVER_NAME, IE_NAMES};
use crate::safari::{SafariManager, SAFARIDRIVER_NAME, SAFARI_NAME};
use std::{env, fs};

use crate::config::OS::WINDOWS;
use crate::config::{str_to_os, ManagerConfig};
use is_executable::IsExecutable;
use reqwest::{Client, Proxy};
use std::collections::HashMap;
use std::error::Error;
use std::path::{Path, PathBuf};
use std::process::Command;
use std::time::Duration;

use crate::downloads::download_to_tmp_folder;
use crate::files::{parse_version, uncompress, BrowserPath};
use crate::grid::GRID_NAME;
use crate::logger::Logger;
use crate::metadata::{create_browser_metadata, get_browser_version_from_metadata};
use crate::safaritp::{SafariTPManager, SAFARITP_NAMES};

pub mod chrome;
pub mod config;
pub mod downloads;
pub mod edge;
pub mod files;
pub mod firefox;
pub mod grid;
pub mod iexplorer;
pub mod logger;
pub mod metadata;
pub mod mirror;
pub mod safari;
pub mod safaritp;

pub const REQUEST_TIMEOUT_SEC: u64 = 300; // The timeout is applied from when the request starts connecting until the response body has finished
pub const STABLE: &str = "stable";
pub const BETA: &str = "beta";
pub const DEV: &str = "dev";
pub const CANARY: &str = "canary";
pub const NIGHTLY: &str = "nightly";
pub const WMIC_COMMAND: &str = r#"wmic datafile where name='{}' get Version /value"#;
pub const WMIC_COMMAND_OS: &str = r#"wmic os get osarchitecture"#;
pub const REG_QUERY: &str = r#"REG QUERY {} /v version"#;
pub const REG_QUERY_FIND: &str = r#"REG QUERY {} /f {}"#;
pub const PLIST_COMMAND: &str =
    r#"/usr/libexec/PlistBuddy -c "print :CFBundleShortVersionString" {}/Contents/Info.plist"#;
pub const DASH_VERSION: &str = "{}{}{} -v";
pub const DASH_DASH_VERSION: &str = "{}{}{} --version";
pub const DOUBLE_QUOTE: &str = "\"";
pub const SINGLE_QUOTE: &str = "'";
pub const ENV_PROGRAM_FILES: &str = "PROGRAMFILES";
pub const ENV_PROGRAM_FILES_X86: &str = "PROGRAMFILES(X86)";
pub const ENV_LOCALAPPDATA: &str = "LOCALAPPDATA";
pub const ENV_X86: &str = " (x86)";
pub const ARCH_X86: &str = "x86";
pub const ARCH_AMD64: &str = "amd64";
pub const ARCH_ARM64: &str = "arm64";
pub const ENV_PROCESSOR_ARCHITECTURE: &str = "PROCESSOR_ARCHITECTURE";
pub const WHERE_COMMAND: &str = "where {}";
pub const WHICH_COMMAND: &str = "which {}";
pub const TTL_BROWSERS_SEC: u64 = 3600;
pub const TTL_DRIVERS_SEC: u64 = 3600;
pub const UNAME_COMMAND: &str = "uname -{}";
pub const ESCAPE_COMMAND: &str = "printf %q \"{}\"";
pub const CRLF: &str = "\r\n";
pub const LF: &str = "\n";
pub const SNAPSHOT: &str = "SNAPSHOT";
pub const OFFLINE_REQUEST_ERR_MSG: &str = "Unable to discover proper {} version in offline mode";
pub const OFFLINE_DOWNLOAD_ERR_MSG: &str = "Unable to download {} in offline mode";
pub const UNC_PREFIX: &str = r#"\\?\"#;

pub trait SeleniumManager {
    // ----------------------------------------------------------
    // Browser-specific functions
    // ----------------------------------------------------------

    fn get_browser_name(&self) -> &str;

    fn get_http_client(&self) -> &Client;

    fn set_http_client(&mut self, http_client: Client);

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str>;

    fn discover_browser_version(&mut self) -> Option<String>;

    fn get_driver_name(&self) -> &str;

    fn request_driver_version(&mut self) -> Result<String, Box<dyn Error>>;

    fn request_browser_version(&mut self) -> Result<Option<String>, Box<dyn Error>>;

    fn get_driver_url(&mut self) -> Result<String, Box<dyn Error>>;

    fn get_driver_path_in_cache(&self) -> PathBuf;

    fn get_config(&self) -> &ManagerConfig;

    fn get_config_mut(&mut self) -> &mut ManagerConfig;

    fn set_config(&mut self, config: ManagerConfig);

    fn get_logger(&self) -> &Logger;

    fn set_logger(&mut self, log: Logger);

    fn download_browser(&mut self) -> Result<Option<PathBuf>, Box<dyn Error>>;

    // ----------------------------------------------------------
    // Shared functions
    // ----------------------------------------------------------

    fn download_driver(&mut self) -> Result<(), Box<dyn Error>> {
        let driver_url = self.get_driver_url()?;
        self.get_logger()
            .debug(format!("Driver URL: {}", driver_url));
        let (_tmp_folder, driver_zip_file) =
            download_to_tmp_folder(self.get_http_client(), driver_url, self.get_logger())?;

        if self.is_grid() {
            let driver_path_in_cache = Self::get_driver_path_in_cache(self);
            create_parent_path_if_not_exists(&driver_path_in_cache);
            Ok(fs::rename(driver_zip_file, driver_path_in_cache)?)
        } else {
            let driver_path_in_cache = Self::get_driver_path_in_cache(self);
            let driver_name_with_extension = self.get_driver_name_with_extension();
            uncompress(
                &driver_zip_file,
                &driver_path_in_cache,
                self.get_logger(),
                Some(driver_name_with_extension),
            )
        }
    }

    fn detect_browser_path(&mut self) -> Option<PathBuf> {
        let mut browser_version = self.get_browser_version();
        if browser_version.eq_ignore_ascii_case(CANARY) {
            browser_version = NIGHTLY;
        } else if !self.is_browser_version_unstable() {
            browser_version = STABLE;
        }

        let browser_path = self
            .get_browser_path_map()
            .get(&BrowserPath::new(str_to_os(self.get_os()), browser_version))
            .cloned()
            .unwrap_or_default();

        let mut full_browser_path = Path::new(browser_path).to_path_buf();
        if WINDOWS.is(self.get_os()) {
            let envs = vec![ENV_PROGRAM_FILES, ENV_PROGRAM_FILES_X86, ENV_LOCALAPPDATA];

            for env in envs {
                let mut env_value = env::var(env).unwrap_or_default();
                if env.eq(ENV_PROGRAM_FILES) && env_value.contains(ENV_X86) {
                    // This special case is required to keep compliance between x32 and x64
                    // architectures (since the selenium-manager in Windows is compiled as x32 binary)
                    env_value = env_value.replace(ENV_X86, "");
                }
                let parent_path = Path::new(&env_value);
                full_browser_path = parent_path.join(browser_path);
                if full_browser_path.exists() {
                    break;
                }
            }
        }

        if full_browser_path.exists() {
            let canon_browser_path = self.canonicalize_path(full_browser_path);
            self.get_logger().debug(format!(
                "{} detected at {}",
                self.get_browser_name(),
                canon_browser_path
            ));
            self.set_browser_path(canon_browser_path.clone());

            Some(Path::new(&canon_browser_path).to_path_buf())
        } else {
            // Check browser in PATH
            let browser_name = self.get_browser_name();
            self.get_logger()
                .debug(format!("Checking {} in PATH", browser_name));
            let browser_in_path = self.find_browser_in_path();
            if let Some(path) = &browser_in_path {
                self.get_logger().debug(format!(
                    "Found {} in PATH: {}",
                    browser_name,
                    path.display()
                ));
            } else {
                self.get_logger()
                    .debug(format!("{} not found in PATH", browser_name));
            }
            browser_in_path
        }
    }

    fn detect_browser_version(&self, commands: Vec<String>) -> Option<String> {
        let browser_name = &self.get_browser_name();

        self.get_logger().debug(format!(
            "Using shell command to find out {} version",
            browser_name
        ));
        let mut browser_version: Option<String> = None;
        for command in commands.iter() {
            let output = match self.run_shell_command_with_log(command.to_string()) {
                Ok(out) => out,
                Err(_e) => continue,
            };
            let full_browser_version = parse_version(output, self.get_logger()).unwrap_or_default();
            if full_browser_version.is_empty() {
                continue;
            }
            self.get_logger().trace(format!(
                "The version of {} is {}",
                browser_name, full_browser_version
            ));

            browser_version = Some(full_browser_version);
            break;
        }

        browser_version
    }

    fn discover_driver_version(&mut self) -> Result<String, Box<dyn Error>> {
        let mut download_browser = self.is_force_browser_download();
        let major_browser_version = self.get_major_browser_version();

        // First, we try to discover the browser version
        if !download_browser {
            match self.discover_browser_version() {
                Some(version) => {
                    if !self.is_safari() {
                        self.get_logger().debug(format!(
                            "Detected browser: {} {}",
                            self.get_browser_name(),
                            version
                        ));
                    }
                    let discovered_major_browser_version =
                        self.get_major_version(&version).unwrap_or_default();

                    if self.is_browser_version_stable() {
                        let online_browser_version = self.request_browser_version()?;
                        if online_browser_version.is_some() {
                            let major_online_browser_version =
                                self.get_major_version(&online_browser_version.unwrap())?;
                            if major_browser_version.eq(&major_online_browser_version) {
                                self.get_logger().debug(format!(
                                    "Online stable browser version ({}) different to specified browser version ({})",
                                    major_online_browser_version,
                                    major_browser_version,
                                ));
                                download_browser = true;
                            } else {
                                self.get_logger().debug(format!(
                                    "Online stable {} version ({}) is the same as the one installed in the system",
                                    self.get_browser_name(),
                                    major_online_browser_version,
                                ));
                            }
                        }
                    } else if !major_browser_version.is_empty()
                        && !self.is_browser_version_unstable()
                        && !major_browser_version.eq(&discovered_major_browser_version)
                    {
                        self.get_logger().debug(format!(
                            "Discovered browser version ({}) different to specified browser version ({})",
                            discovered_major_browser_version,
                            major_browser_version,
                        ));
                        download_browser = true;
                    } else {
                        self.set_browser_version(version);
                    }
                }
                None => {
                    self.get_logger().debug(format!(
                        "{} has not been discovered in the system",
                        self.get_browser_name()
                    ));
                    download_browser = true;
                }
            }
        }

        if download_browser {
            let browser_path = self.download_browser()?;
            if browser_path.is_some() {
                self.get_logger().debug(format!(
                    "{} {} has been downloaded at {}",
                    self.get_browser_name(),
                    self.get_browser_version(),
                    browser_path.unwrap().display()
                ));
            } else if self.is_browser_version_unstable() {
                return Err(format!("Browser version '{major_browser_version}' not found").into());
            } else if !self.is_iexplorer() && !self.is_grid() {
                self.get_logger().warn(format!(
                    "The version of {} cannot be detected. Trying with latest driver version",
                    self.get_browser_name()
                ));
            }
        }

        // Second, we request the driver version using online metadata
        let driver_version = self.request_driver_version()?;
        if driver_version.is_empty() {
            Err(format!(
                "The {} version cannot be discovered",
                self.get_driver_name()
            )
            .into())
        } else {
            self.get_logger().debug(format!(
                "Required driver: {} {}",
                self.get_driver_name(),
                driver_version
            ));
            Ok(driver_version)
        }
    }

    fn find_browser_in_path(&self) -> Option<PathBuf> {
        let browser_path = self.execute_which_in_shell(self.get_browser_name());
        if let Some(path) = browser_path {
            return Some(Path::new(&path).to_path_buf());
        }
        None
    }

    fn find_driver_in_path(&self) -> (Option<String>, Option<String>) {
        match self.run_shell_command_with_log(format_three_args(
            DASH_DASH_VERSION,
            self.get_driver_name(),
            "",
            "",
        )) {
            Ok(output) => {
                let parsed_version = parse_version(output, self.get_logger()).unwrap_or_default();
                if !parsed_version.is_empty() {
                    let driver_path = self.execute_which_in_shell(self.get_driver_name());
                    return (Some(parsed_version), driver_path);
                }
                (None, None)
            }
            Err(_) => (None, None),
        }
    }

    fn execute_which_in_shell(&self, command: &str) -> Option<String> {
        let which_command = if WINDOWS.is(self.get_os()) {
            WHERE_COMMAND
        } else {
            WHICH_COMMAND
        };
        let path = match self.run_shell_command_with_log(format_one_arg(which_command, command)) {
            Ok(path) => {
                let path_vector = split_lines(path.as_str());
                if path_vector.len() == 1 {
                    self.get_first_in_vector(path_vector)
                } else {
                    let exec_paths: Vec<&str> = path_vector
                        .into_iter()
                        .filter(|p| Path::new(p).is_executable())
                        .collect();
                    if exec_paths.is_empty() {
                        None
                    } else {
                        self.get_first_in_vector(exec_paths)
                    }
                }
            }
            Err(_) => None,
        };
        path
    }

    fn get_first_in_vector(&self, vector: Vec<&str>) -> Option<String> {
        if vector.is_empty() {
            return None;
        }
        let first = vector.first().unwrap().to_string();
        if first.is_empty() {
            None
        } else {
            Some(first)
        }
    }

    fn is_safari(&self) -> bool {
        self.get_browser_name().contains(SAFARI_NAME)
    }

    fn is_iexplorer(&self) -> bool {
        self.get_browser_name().eq(IE_NAMES[0])
    }

    fn is_grid(&self) -> bool {
        self.get_browser_name().eq(GRID_NAME)
    }

    fn is_browser_version_unstable(&self) -> bool {
        let browser_version = self.get_browser_version();
        browser_version.eq_ignore_ascii_case(BETA)
            || browser_version.eq_ignore_ascii_case(DEV)
            || browser_version.eq_ignore_ascii_case(NIGHTLY)
            || browser_version.eq_ignore_ascii_case(CANARY)
    }

    fn is_browser_version_stable(&self) -> bool {
        let browser_version = self.get_browser_version();
        browser_version.is_empty() || browser_version.eq_ignore_ascii_case(STABLE)
    }

    fn resolve_driver(&mut self) -> Result<PathBuf, Box<dyn Error>> {
        let mut driver_in_path = None;
        let mut driver_in_path_version = None;

        // Try to find driver in PATH
        if !self.is_safari() && !self.is_grid() {
            self.get_logger()
                .debug(format!("Checking {} in PATH", self.get_driver_name()));
            (driver_in_path_version, driver_in_path) = self.find_driver_in_path();
            if let (Some(version), Some(path)) = (&driver_in_path_version, &driver_in_path) {
                self.get_logger().debug(format!(
                    "Found {} {} in PATH: {}",
                    self.get_driver_name(),
                    version,
                    path
                ));
            } else {
                self.get_logger()
                    .debug(format!("{} not found in PATH", self.get_driver_name()));
            }
        }

        // Discover proper driver version
        if self.get_driver_version().is_empty() {
            match self.discover_driver_version() {
                Ok(driver_version) => {
                    self.set_driver_version(driver_version);
                }
                Err(err) => {
                    if driver_in_path_version.is_some() {
                        self.get_logger().warn(format!(
                            "Exception trying to discover {} version: {}",
                            self.get_driver_name(),
                            err
                        ));
                    } else {
                        return Err(err);
                    }
                }
            }
        }

        // If driver is in path, always use it
        if let (Some(version), Some(path)) = (&driver_in_path_version, &driver_in_path) {
            // If proper driver version is not the same as the driver in path, display warning
            if !self.get_driver_version().is_empty() && !version.eq(self.get_driver_version()) {
                self.get_logger().warn(format!(
                    "The {} version ({}) detected in PATH at {} might not be compatible with the detected {} version ({}); currently, {} {} is recommended for {} {}.*, so it is advised to delete the driver in PATH and retry",
                    self.get_driver_name(),
                    version,
                    path,
                    self.get_browser_name(),
                    self.get_browser_version(),
                    self.get_driver_name(),
                    self.get_driver_version(),
                    self.get_browser_name(),
                    self.get_major_browser_version()
                ));
            }
            self.set_driver_version(version.to_string());
            return Ok(PathBuf::from(path));
        }

        // If driver was not in the PATH, try to find it in the cache
        let driver_path = self.get_driver_path_in_cache();
        if driver_path.exists() {
            if !self.is_safari() {
                self.get_logger().debug(format!(
                    "{} {} already in the cache",
                    self.get_driver_name(),
                    self.get_driver_version()
                ));
            }
        } else {
            // If driver is not in the cache, download it
            self.assert_online_or_err(OFFLINE_DOWNLOAD_ERR_MSG)?;
            self.download_driver()?;
        }
        Ok(driver_path)
    }

    fn run_shell_command_with_log(&self, command: String) -> Result<String, Box<dyn Error>> {
        self.get_logger()
            .debug(format!("Running command: {}", command));
        let output = run_shell_command_by_os(self.get_os(), command)?;
        self.get_logger().debug(format!("Output: {:?}", output));
        Ok(output)
    }

    fn get_major_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 0)
    }

    fn get_minor_version(&self, full_version: &str) -> Result<String, Box<dyn Error>> {
        get_index_version(full_version, 1)
    }

    fn get_selenium_release_version(&self) -> Result<String, Box<dyn Error>> {
        let driver_version = self.get_driver_version();
        if driver_version.contains(SNAPSHOT) {
            return Ok(NIGHTLY.to_string());
        }

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
        Ok(format!("selenium-{release_version}"))
    }

    fn assert_online_or_err(&self, message: &str) -> Result<(), Box<dyn Error>> {
        if self.is_offline() {
            return Err(format_one_arg(message, self.get_driver_name()).into());
        }
        Ok(())
    }

    fn get_driver_name_with_extension(&self) -> String {
        format!(
            "{}{}",
            self.get_driver_name(),
            get_binary_extension(self.get_os())
        )
    }

    fn get_browser_name_with_extension(&self) -> String {
        format!(
            "{}{}",
            self.get_browser_name(),
            get_binary_extension(self.get_os())
        )
    }

    // ----------------------------------------------------------
    // Getters and setters for configuration parameters
    // ----------------------------------------------------------

    fn get_os(&self) -> &str {
        self.get_config().os.as_str()
    }

    fn set_os(&mut self, os: String) {
        self.get_config_mut().os = os;
    }

    fn get_arch(&self) -> &str {
        self.get_config().arch.as_str()
    }

    fn set_arch(&mut self, arch: String) {
        self.get_config_mut().arch = arch;
    }

    fn get_browser_version(&self) -> &str {
        self.get_config().browser_version.as_str()
    }

    fn get_major_browser_version(&self) -> String {
        if self.is_browser_version_stable() {
            STABLE.to_string()
        } else if self.is_browser_version_unstable() {
            self.get_browser_version().to_string()
        } else {
            self.get_major_version(self.get_browser_version())
                .unwrap_or_default()
        }
    }

    fn set_browser_version(&mut self, browser_version: String) {
        if !browser_version.is_empty() {
            self.get_config_mut().browser_version = browser_version;
        }
    }

    fn get_driver_version(&self) -> &str {
        self.get_config().driver_version.as_str()
    }

    fn get_major_driver_version(&self) -> String {
        self.get_major_version(self.get_driver_version())
            .unwrap_or_default()
    }

    fn set_driver_version(&mut self, driver_version: String) {
        if !driver_version.is_empty() {
            self.get_config_mut().driver_version = driver_version;
        }
    }

    fn get_browser_path(&self) -> &str {
        self.get_config().browser_path.as_str()
    }

    fn set_browser_path(&mut self, browser_path: String) {
        if !browser_path.is_empty() {
            self.get_config_mut().browser_path = browser_path;
        }
    }

    fn canonicalize_path(&self, path_buf: PathBuf) -> String {
        let canon_path = path_buf
            .as_path()
            .canonicalize()
            .unwrap()
            .to_str()
            .unwrap()
            .to_string();
        if WINDOWS.is(self.get_os()) {
            canon_path.replace(UNC_PREFIX, "")
        } else {
            canon_path
        }
    }

    fn get_escaped_path(&self, string_path: String) -> String {
        let original_path = string_path.clone();
        let mut escaped_path = string_path;
        let path = Path::new(&original_path);

        if path.exists() {
            escaped_path = self.canonicalize_path(path.to_path_buf());
            if WINDOWS.is(self.get_os()) {
                escaped_path = escaped_path.replace('\\', "\\\\");
            } else {
                escaped_path = run_shell_command(
                    "bash",
                    "-c",
                    format_one_arg(ESCAPE_COMMAND, escaped_path.as_str()),
                )
                .unwrap_or_default();
                if escaped_path.is_empty() {
                    escaped_path = original_path.clone();
                }
            }
        }
        self.get_logger().trace(format!(
            "Original path: {} - Escaped path: {}",
            original_path, escaped_path
        ));
        escaped_path
    }

    fn get_proxy(&self) -> &str {
        self.get_config().proxy.as_str()
    }

    fn set_proxy(&mut self, proxy: String) -> Result<(), Box<dyn Error>> {
        if !proxy.is_empty() && !self.is_offline() {
            self.get_logger().debug(format!("Using proxy: {}", &proxy));
            self.get_config_mut().proxy = proxy;
            self.update_http_client()?;
        }
        Ok(())
    }

    fn get_timeout(&self) -> u64 {
        self.get_config().timeout
    }

    fn set_timeout(&mut self, timeout: u64) -> Result<(), Box<dyn Error>> {
        if timeout != REQUEST_TIMEOUT_SEC {
            self.get_config_mut().timeout = timeout;
            self.get_logger()
                .debug(format!("Using timeout of {} seconds", timeout));
            self.update_http_client()?;
        }
        Ok(())
    }

    fn update_http_client(&mut self) -> Result<(), Box<dyn Error>> {
        let proxy = self.get_proxy();
        let timeout = self.get_timeout();
        let http_client = create_http_client(timeout, proxy)?;
        self.set_http_client(http_client);
        Ok(())
    }

    fn get_driver_ttl(&self) -> u64 {
        self.get_config().driver_ttl
    }

    fn set_driver_ttl(&mut self, driver_ttl: u64) {
        self.get_config_mut().driver_ttl = driver_ttl;
    }

    fn get_browser_ttl(&self) -> u64 {
        self.get_config().browser_ttl
    }

    fn set_browser_ttl(&mut self, browser_ttl: u64) {
        self.get_config_mut().browser_ttl = browser_ttl;
    }

    fn is_offline(&self) -> bool {
        self.get_config().offline
    }

    fn set_offline(&mut self, offline: bool) {
        if offline {
            self.get_config_mut().offline = true;
        }
    }

    fn is_force_browser_download(&self) -> bool {
        self.get_config().force_browser_download
    }

    fn set_force_browser_download(&mut self, force_browser_download: bool) {
        if force_browser_download {
            self.get_config_mut().force_browser_download = true;
        }
    }
}

// ----------------------------------------------------------
// Public functions
// ----------------------------------------------------------

pub fn get_manager_by_browser(
    browser_name: String,
) -> Result<Box<dyn SeleniumManager>, Box<dyn Error>> {
    let browser_name_lower_case = browser_name.to_ascii_lowercase();
    if browser_name_lower_case.eq(CHROME_NAME) {
        Ok(ChromeManager::new()?)
    } else if browser_name_lower_case.eq(FIREFOX_NAME) {
        Ok(FirefoxManager::new()?)
    } else if EDGE_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(EdgeManager::new()?)
    } else if IE_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(IExplorerManager::new()?)
    } else if browser_name_lower_case.eq(SAFARI_NAME) {
        Ok(SafariManager::new()?)
    } else if SAFARITP_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(SafariTPManager::new()?)
    } else {
        Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("Invalid browser name: {browser_name}"),
        )))
    }
}

pub fn get_manager_by_driver(
    driver_name: String,
) -> Result<Box<dyn SeleniumManager>, Box<dyn Error>> {
    if driver_name.eq_ignore_ascii_case(CHROMEDRIVER_NAME) {
        Ok(ChromeManager::new()?)
    } else if driver_name.eq_ignore_ascii_case(GECKODRIVER_NAME) {
        Ok(FirefoxManager::new()?)
    } else if driver_name.eq_ignore_ascii_case(EDGEDRIVER_NAME) {
        Ok(EdgeManager::new()?)
    } else if driver_name.eq_ignore_ascii_case(IEDRIVER_NAME) {
        Ok(IExplorerManager::new()?)
    } else if driver_name.eq_ignore_ascii_case(SAFARIDRIVER_NAME) {
        Ok(SafariManager::new()?)
    } else {
        Err(Box::new(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            format!("Invalid driver name: {driver_name}"),
        )))
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

pub fn create_http_client(timeout: u64, proxy: &str) -> Result<Client, Box<dyn Error>> {
    let mut client_builder = Client::builder()
        .danger_accept_invalid_certs(true)
        .use_rustls_tls()
        .timeout(Duration::from_secs(timeout));
    if !proxy.is_empty() {
        client_builder = client_builder.proxy(Proxy::all(proxy)?);
    }
    Ok(client_builder.build().unwrap_or_default())
}

pub fn run_shell_command(
    shell: &str,
    flag: &str,
    command: String,
) -> Result<String, Box<dyn Error>> {
    let output = Command::new(shell)
        .args([flag, command.as_str()])
        .output()?;
    Ok(
        strip_trailing_newline(String::from_utf8_lossy(&output.stdout).to_string().as_str())
            .to_string(),
    )
}

pub fn run_shell_command_by_os(os: &str, command: String) -> Result<String, Box<dyn Error>> {
    let (shell, flag) = if WINDOWS.is(os) {
        ("cmd", "/c")
    } else {
        ("sh", "-c")
    };
    run_shell_command(shell, flag, command)
}

pub fn format_one_arg(string: &str, arg1: &str) -> String {
    string.replacen("{}", arg1, 1)
}

pub fn format_two_args(string: &str, arg1: &str, arg2: &str) -> String {
    string.replacen("{}", arg1, 1).replacen("{}", arg2, 1)
}

pub fn format_three_args(string: &str, arg1: &str, arg2: &str, arg3: &str) -> String {
    string
        .replacen("{}", arg1, 1)
        .replacen("{}", arg2, 1)
        .replacen("{}", arg3, 1)
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

fn strip_trailing_newline(input: &str) -> &str {
    input
        .strip_suffix(CRLF)
        .or_else(|| input.strip_suffix(LF))
        .unwrap_or(input)
}

fn split_lines(string: &str) -> Vec<&str> {
    if string.contains(CRLF) {
        string.split(CRLF).collect()
    } else {
        string.split(LF).collect()
    }
}
