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
use crate::config::ARCH::{ARM64, ARMV7, X32, X64};
use crate::config::OS::{MACOS, WINDOWS};
use crate::config::{str_to_os, ManagerConfig};
use crate::downloads::download_to_tmp_folder;
use crate::edge::{EdgeManager, EDGEDRIVER_NAME, EDGE_NAMES, WEBVIEW2_NAME};
use crate::electron::{ElectronManager, ELECTRON_NAME};
use crate::files::get_win_file_version;
use crate::files::{
    capitalize, collect_files_from_cache, create_path_if_not_exists, default_cache_folder,
    find_latest_from_cache, get_binary_extension, path_to_string,
};
use crate::files::{parse_version, uncompress, BrowserPath};
use crate::firefox::{FirefoxManager, FIREFOX_NAME, GECKODRIVER_NAME};
use crate::grid::GRID_NAME;
use crate::iexplorer::{IExplorerManager, IEDRIVER_NAME, IE_NAMES};
use crate::lock::Lock;
use crate::logger::Logger;
use crate::metadata::{
    create_browser_metadata, create_stats_metadata, get_browser_version_from_metadata,
    get_metadata, is_stats_in_metadata, write_metadata,
};
use crate::safari::{SafariManager, SAFARIDRIVER_NAME, SAFARI_NAME};
use crate::safaritp::{SafariTPManager, SAFARITP_NAMES};
use crate::shell::{
    run_shell_command, run_shell_command_by_os, run_shell_command_with_log, Command,
};
use crate::stats::{send_stats_to_plausible, Props};
use anyhow::anyhow;
use anyhow::Error;
use reqwest::{Client, Proxy};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::mpsc::{Receiver, Sender};
use std::time::Duration;
use std::{env, fs, thread};
use walkdir::DirEntry;
use which::which;

pub mod chrome;
pub mod config;
pub mod downloads;
pub mod edge;
pub mod electron;
pub mod files;
pub mod firefox;
pub mod grid;
pub mod iexplorer;
pub mod lock;
pub mod logger;
pub mod metadata;
pub mod mirror;
pub mod safari;
pub mod safaritp;
pub mod shell;
pub mod stats;

pub const REQUEST_TIMEOUT_SEC: u64 = 300; // The timeout is applied from when the request starts connecting until the response body has finished
pub const STABLE: &str = "stable";
pub const BETA: &str = "beta";
pub const DEV: &str = "dev";
pub const CANARY: &str = "canary";
pub const NIGHTLY: &str = "nightly";
pub const ESR: &str = "esr";
pub const REG_VERSION_ARG: &str = "version";
pub const REG_CURRENT_VERSION_ARG: &str = "CurrentVersion";
pub const REG_PV_ARG: &str = "pv";
pub const PLIST_COMMAND: &str =
    r#"/usr/libexec/PlistBuddy -c "print :CFBundleShortVersionString" {}/Contents/Info.plist"#;
pub const HDIUTIL_ATTACH_COMMAND: &str = "hdiutil attach {}";
pub const HDIUTIL_DETACH_COMMAND: &str = "hdiutil detach /Volumes/{}";
pub const CP_VOLUME_COMMAND: &str = "cp -R /Volumes/{}/{}.app {}";
pub const MSIEXEC_INSTALL_COMMAND: &str = "start /wait msiexec /i {} /qn ALLOWDOWNGRADE=1";
pub const WINDOWS_CHECK_ADMIN_COMMAND: &str = "net session";
pub const DASH_VERSION: &str = "{}{}{} -v";
pub const DASH_DASH_VERSION: &str = "{}{}{} --version";
pub const DOUBLE_QUOTE: &str = r#"""#;
pub const SINGLE_QUOTE: &str = "'";
pub const ENV_PROGRAM_FILES: &str = "PROGRAMFILES";
pub const ENV_PROGRAM_FILES_X86: &str = "PROGRAMFILES(X86)";
pub const ENV_LOCALAPPDATA: &str = "LOCALAPPDATA";
pub const ENV_PROCESSOR_ARCHITECTURE: &str = "PROCESSOR_ARCHITECTURE";
pub const ENV_X86: &str = " (x86)";
pub const ARCH_X86: &str = "x86";
pub const ARCH_X64: &str = "x86_64";
pub const ARCH_ARM64: &str = "arm64";
pub const ARCH_ARM7L: &str = "arm7l";
pub const ARCH_OTHER: &str = "other";
pub const TTL_SEC: u64 = 3600;
pub const UNAME_COMMAND: &str = "uname -{}";
pub const ESCAPE_COMMAND: &str = r#"printf %q "{}""#;
pub const SNAPSHOT: &str = "SNAPSHOT";
pub const OFFLINE_REQUEST_ERR_MSG: &str = "Unable to discover proper {} version in offline mode";
pub const OFFLINE_DOWNLOAD_ERR_MSG: &str = "Unable to download {} in offline mode";
pub const UNAVAILABLE_DOWNLOAD_ERR_MSG: &str = "{}{} not available for download";
pub const UNAVAILABLE_DOWNLOAD_WITH_MIN_VERSION_ERR_MSG: &str =
    "{} {} not available for download (minimum version: {})";
pub const NOT_ADMIN_FOR_EDGE_INSTALLER_ERR_MSG: &str =
    "{} can only be installed in Windows with administrator permissions";
pub const ONLINE_DISCOVERY_ERROR_MESSAGE: &str = "Unable to discover {}{} in online repository";
pub const UNC_PREFIX: &str = r"\\?\";
pub const SM_BETA_LABEL: &str = "0.";
pub const LATEST_RELEASE: &str = "latest";

pub trait SeleniumManager {
    // ----------------------------------------------------------
    // Browser-specific functions
    // ----------------------------------------------------------

    fn get_browser_name(&self) -> &str;

    fn get_browser_names_in_path(&self) -> Vec<&str>;

    fn get_http_client(&self) -> &Client;

    fn set_http_client(&mut self, http_client: Client);

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str>;

    fn discover_browser_version(&mut self) -> Result<Option<String>, Error>;

    fn get_driver_name(&self) -> &str;

    fn request_driver_version(&mut self) -> Result<String, Error>;

    fn request_browser_version(&mut self) -> Result<Option<String>, Error>;

    fn get_driver_url(&mut self) -> Result<String, Error>;

    fn get_driver_path_in_cache(&self) -> Result<PathBuf, Error>;

    fn get_config(&self) -> &ManagerConfig;

    fn get_config_mut(&mut self) -> &mut ManagerConfig;

    fn set_config(&mut self, config: ManagerConfig);

    fn get_logger(&self) -> &Logger;

    fn set_logger(&mut self, log: Logger);

    fn get_sender(&self) -> &Sender<String>;

    fn get_receiver(&self) -> &Receiver<String>;

    fn get_platform_label(&self) -> &str;

    fn request_latest_browser_version_from_online(
        &mut self,
        browser_version: &str,
    ) -> Result<String, Error>;

    fn request_fixed_browser_version_from_online(
        &mut self,
        browser_version: &str,
    ) -> Result<String, Error>;

    fn get_min_browser_version_for_download(&self) -> Result<i32, Error>;

    fn get_browser_binary_path(&mut self, browser_version: &str) -> Result<PathBuf, Error>;

    fn get_browser_url_for_download(&mut self, browser_version: &str) -> Result<String, Error>;

    fn get_browser_label_for_download(&self, _browser_version: &str)
        -> Result<Option<&str>, Error>;

    fn is_download_browser(&self) -> bool;

    fn set_download_browser(&mut self, download_browser: bool);

    fn is_snap(&self, browser_path: &str) -> bool;

    fn get_snap_path(&self) -> Option<PathBuf>;

    // ----------------------------------------------------------
    // Shared functions
    // ----------------------------------------------------------

    fn download_driver(&mut self) -> Result<(), Error> {
        let driver_path_in_cache = self.get_driver_path_in_cache()?;
        let driver_name_with_extension = self.get_driver_name_with_extension();

        let mut lock = Lock::acquire(
            self.get_logger(),
            &driver_path_in_cache,
            Some(driver_name_with_extension.clone()),
        )?;
        if !lock.exists() && driver_path_in_cache.exists() {
            self.get_logger().debug(format!(
                "Driver already in cache: {}",
                driver_path_in_cache.display()
            ));
            return Ok(());
        }

        let driver_url = self.get_driver_url()?;
        self.get_logger().debug(format!(
            "Downloading {} {} from {}",
            self.get_driver_name(),
            self.get_driver_version(),
            driver_url
        ));
        let (_tmp_folder, driver_zip_file) =
            download_to_tmp_folder(self.get_http_client(), driver_url, self.get_logger())?;

        if self.is_grid() {
            let driver_path_in_cache = self.get_driver_path_in_cache()?;
            fs::rename(driver_zip_file, driver_path_in_cache)?;
        } else {
            uncompress(
                &driver_zip_file,
                &driver_path_in_cache,
                self.get_logger(),
                self.get_os(),
                Some(driver_name_with_extension),
                None,
            )?;
        }

        lock.release();
        Ok(())
    }

    fn download_browser(
        &mut self,
        original_browser_version: &str,
    ) -> Result<Option<PathBuf>, Error> {
        let browser_version;
        let cache_path = self.get_cache_path()?;
        let mut metadata = get_metadata(self.get_logger(), &cache_path);
        let major_browser_version = self.get_major_browser_version();
        let major_browser_version_int = major_browser_version.parse::<i32>().unwrap_or_default();

        // Browser version should be available for download
        let min_browser_version_for_download = self.get_min_browser_version_for_download()?;
        if !self.is_browser_version_unstable()
            && !self.is_browser_version_stable()
            && !self.is_browser_version_empty()
            && major_browser_version_int < min_browser_version_for_download
        {
            return Err(anyhow!(format_three_args(
                UNAVAILABLE_DOWNLOAD_WITH_MIN_VERSION_ERR_MSG,
                self.get_browser_name(),
                &major_browser_version,
                &min_browser_version_for_download.to_string(),
            )));
        }

        if self.is_version_specific(original_browser_version) {
            browser_version = original_browser_version.to_string();
        } else {
            // Browser version is checked in the local metadata
            match get_browser_version_from_metadata(
                &metadata.browsers,
                self.get_browser_name(),
                &major_browser_version,
            ) {
                Some(version) => {
                    self.get_logger().trace(format!(
                        "Browser with valid TTL. Getting {} version from metadata",
                        self.get_browser_name()
                    ));
                    browser_version = version;
                    self.set_browser_version(browser_version.clone());
                }
                _ => {
                    // If not in metadata, discover version using online metadata
                    if self.is_browser_version_stable() || self.is_browser_version_empty() {
                        browser_version = self
                            .request_latest_browser_version_from_online(original_browser_version)?;
                    } else {
                        browser_version = self
                            .request_fixed_browser_version_from_online(original_browser_version)?;
                    }
                    self.set_browser_version(browser_version.clone());

                    let browser_ttl = self.get_ttl();
                    if browser_ttl > 0
                        && !self.is_browser_version_empty()
                        && !self.is_browser_version_stable()
                    {
                        metadata.browsers.push(create_browser_metadata(
                            self.get_browser_name(),
                            &major_browser_version,
                            &browser_version,
                            browser_ttl,
                        ));
                        write_metadata(&metadata, self.get_logger(), cache_path);
                    }
                }
            }
        }
        self.get_logger().debug(format!(
            "Required browser: {} {}",
            self.get_browser_name(),
            browser_version
        ));

        // Checking if browser version is in the cache
        let browser_binary_path = self.get_browser_binary_path(original_browser_version)?;
        if browser_binary_path.exists() {
            self.get_logger().debug(format!(
                "{} {} already exists",
                self.get_browser_name(),
                browser_version
            ));
        } else {
            // If browser is not available, download it
            if WINDOWS.is(self.get_os()) && self.is_edge() && !self.is_windows_admin() {
                return Err(anyhow!(format_one_arg(
                    NOT_ADMIN_FOR_EDGE_INSTALLER_ERR_MSG,
                    self.get_browser_name(),
                )));
            }

            let browser_path_in_cache = self.get_browser_path_in_cache()?;
            let mut lock = Lock::acquire(self.get_logger(), &browser_path_in_cache, None)?;
            if !lock.exists() && browser_binary_path.exists() {
                self.get_logger().debug(format!(
                    "Browser already in cache: {}",
                    browser_binary_path.display()
                ));
                self.set_browser_path(path_to_string(&browser_binary_path));
                return Ok(Some(browser_binary_path.clone()));
            }

            let browser_url = self.get_browser_url_for_download(original_browser_version)?;
            self.get_logger().debug(format!(
                "Downloading {} {} from {}",
                self.get_browser_name(),
                self.get_browser_version(),
                browser_url
            ));
            let (_tmp_folder, driver_zip_file) =
                download_to_tmp_folder(self.get_http_client(), browser_url, self.get_logger())?;

            let browser_label_for_download =
                self.get_browser_label_for_download(original_browser_version)?;
            uncompress(
                &driver_zip_file,
                &browser_path_in_cache,
                self.get_logger(),
                self.get_os(),
                None,
                browser_label_for_download,
            )?;
            lock.release();
        }
        if browser_binary_path.exists() {
            self.set_browser_path(path_to_string(&browser_binary_path));
            Ok(Some(browser_binary_path))
        } else {
            self.get_logger().warn(format!(
                "Expected {} path does not exist: {}",
                self.get_browser_name(),
                browser_binary_path.display()
            ));
            Ok(None)
        }
    }

    fn get_browser_path_from_version(&self, mut browser_version: &str) -> &str {
        if browser_version.eq_ignore_ascii_case(CANARY) {
            browser_version = NIGHTLY;
        } else if !self.is_unstable(browser_version) {
            browser_version = STABLE;
        }
        self.get_browser_path_map()
            .get(&BrowserPath::new(
                str_to_os(self.get_os()).unwrap(),
                browser_version,
            ))
            .cloned()
            .unwrap_or_default()
    }

    fn detect_browser_path(&mut self) -> Option<PathBuf> {
        let browser_version = self.get_browser_version();
        let browser_path = self.get_browser_path_from_version(browser_version);

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
            let browser_in_path = self.find_browser_in_path();
            if let Some(path) = &browser_in_path {
                if self.is_skip_browser_in_path() {
                    self.get_logger().debug(format!(
                        "Skipping {} in path: {}",
                        self.get_browser_name(),
                        path.display()
                    ));
                    return None;
                } else {
                    self.set_browser_path(path_to_string(path));
                }
            }
            browser_in_path
        }
    }

    fn detect_browser_version(&self, commands: Vec<Command>) -> Option<String> {
        let browser_name = &self.get_browser_name();

        self.get_logger().trace(format!(
            "Using shell command to find out {} version",
            browser_name
        ));
        let mut browser_version: Option<String> = None;
        for driver_version_command in commands.into_iter() {
            let output = match run_shell_command_with_log(
                self.get_logger(),
                self.get_os(),
                driver_version_command,
            ) {
                Ok(out) => out,
                Err(_) => continue,
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

    fn discover_local_browser(&mut self) -> Result<(), Error> {
        let mut download_browser = self.is_force_browser_download();
        if !download_browser && !self.is_electron() {
            let major_browser_version = self.get_major_browser_version();
            match self.discover_browser_version()? {
                Some(discovered_version) => {
                    if !self.is_safari() {
                        self.get_logger().debug(format!(
                            "Detected browser: {} {}",
                            self.get_browser_name(),
                            discovered_version
                        ));
                    }
                    let discovered_major_browser_version = self
                        .get_major_version(&discovered_version)
                        .unwrap_or_default();

                    if self.is_browser_version_stable() || self.is_browser_version_unstable() {
                        let online_browser_version = self.request_browser_version()?;
                        if online_browser_version.is_some() {
                            let major_online_browser_version =
                                self.get_major_version(&online_browser_version.unwrap())?;
                            if discovered_major_browser_version.eq(&major_online_browser_version) {
                                self.get_logger().debug(format!(
                                    "Discovered online {} version ({}) is the same as the detected local {} version",
                                    self.get_browser_name(),
                                    discovered_major_browser_version,
                                    self.get_browser_name(),
                                ));
                                self.set_browser_version(discovered_version);
                            } else {
                                self.get_logger().debug(format!(
                                    "Discovered online {} version ({}) is different to the detected local {} version ({})",
                                    self.get_browser_name(),
                                    major_online_browser_version,
                                    self.get_browser_name(),
                                    discovered_major_browser_version,
                                ));
                                download_browser = true;
                            }
                        } else {
                            self.set_browser_version(discovered_version);
                        }
                    } else if !major_browser_version.is_empty()
                        && !self.is_browser_version_unstable()
                        && !major_browser_version.eq(&discovered_major_browser_version)
                    {
                        self.get_logger().debug(format!(
                            "Discovered {} version ({}) different to specified browser version ({})",
                            self.get_browser_name(),
                            discovered_major_browser_version,
                            major_browser_version,
                        ));
                        download_browser = true;
                    } else {
                        self.set_browser_version(discovered_version);
                    }
                    if self.is_webview2() && PathBuf::from(self.get_browser_path()).is_dir() {
                        let browser_path = format!(
                            r"{}\{}\msedge{}",
                            self.get_browser_path(),
                            &self.get_browser_version(),
                            get_binary_extension(self.get_os())
                        );
                        self.set_browser_path(browser_path);
                    }
                }
                None => {
                    self.get_logger().debug(format!(
                        "{}{} not found in the system",
                        self.get_browser_name(),
                        self.get_browser_version_label()
                    ));
                    download_browser = true;
                }
            }
        }
        self.set_download_browser(download_browser);

        Ok(())
    }

    fn download_browser_if_necessary(
        &mut self,
        original_browser_version: &str,
    ) -> Result<(), Error> {
        if self.is_download_browser()
            && !self.is_avoid_browser_download()
            && !self.is_iexplorer()
            && !self.is_grid()
            && !self.is_safari()
            && !self.is_webview2()
            && !self.is_electron()
        {
            let browser_path = self.download_browser(original_browser_version)?;
            if browser_path.is_some() {
                self.get_logger().debug(format!(
                    "{} {} is available at {}",
                    self.get_browser_name(),
                    self.get_browser_version(),
                    browser_path.unwrap().display()
                ));
            } else if !self.is_iexplorer() && !self.is_grid() && !self.is_safari() {
                return Err(anyhow!(format!(
                    "{}{} cannot be downloaded",
                    self.get_browser_name(),
                    self.get_browser_version_label()
                )));
            }
        }
        Ok(())
    }

    fn discover_driver_version(&mut self) -> Result<String, Error> {
        // We request the driver version using online endpoints
        let driver_version = self.request_driver_version()?;
        if driver_version.is_empty() {
            Err(anyhow!(format!(
                "The {} version cannot be discovered",
                self.get_driver_name()
            )))
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
        for browser_name in self.get_browser_names_in_path().iter() {
            self.get_logger()
                .trace(format!("Checking {} in PATH", browser_name));
            let browser_path = self.execute_which_in_shell(browser_name);
            if let Some(path) = browser_path {
                self.get_logger()
                    .debug(format!("Found {} in PATH: {}", browser_name, &path));
                if self.is_snap(&path) {
                    if let Some(snap_path) = self.get_snap_path() {
                        if snap_path.exists() {
                            self.get_logger().debug(format!(
                                "Using {} snap: {}",
                                browser_name,
                                path_to_string(snap_path.as_path())
                            ));
                            return Some(snap_path);
                        }
                    }
                }
                return Some(Path::new(&path).to_path_buf());
            }
        }
        self.get_logger()
            .debug(format!("{} not found in PATH", self.get_browser_name()));
        None
    }

    fn find_driver_in_path(&self) -> (Option<String>, Option<String>) {
        let driver_version_command = Command::new_single(format_three_args(
            DASH_DASH_VERSION,
            self.get_driver_name(),
            "",
            "",
        ));
        match run_shell_command_by_os(self.get_os(), driver_version_command) {
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

    fn execute_which_in_shell(&self, arg: &str) -> Option<String> {
        match which(arg) {
            Ok(path) => Some(path_to_string(&path)),
            Err(_) => None,
        }
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

    fn is_windows_admin(&self) -> bool {
        let os = self.get_os();
        if WINDOWS.is(os) {
            let command = Command::new_single(WINDOWS_CHECK_ADMIN_COMMAND.to_string());
            let output = run_shell_command_by_os(os, command).unwrap_or_default();
            !output.is_empty() && !output.contains("error") && !output.contains("not recognized")
        } else {
            false
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

    fn is_electron(&self) -> bool {
        self.get_browser_name().eq_ignore_ascii_case(ELECTRON_NAME)
    }

    fn is_firefox(&self) -> bool {
        self.get_browser_name().contains(FIREFOX_NAME)
    }

    fn is_edge(&self) -> bool {
        self.get_browser_name().eq(EDGE_NAMES[0])
    }

    fn is_webview2(&self) -> bool {
        self.get_browser_name().eq(WEBVIEW2_NAME)
    }

    fn is_browser_version_beta(&self) -> bool {
        self.is_beta(self.get_browser_version())
    }

    fn is_beta(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(BETA)
    }

    fn is_browser_version_dev(&self) -> bool {
        self.is_dev(self.get_browser_version())
    }

    fn is_dev(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(DEV)
    }

    fn is_browser_version_nightly(&self) -> bool {
        self.is_nightly(self.get_browser_version())
    }

    fn is_nightly(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(NIGHTLY)
            || browser_version.eq_ignore_ascii_case(CANARY)
    }

    fn is_browser_version_esr(&self) -> bool {
        self.is_esr(self.get_browser_version())
    }

    fn is_esr(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(ESR)
    }

    fn is_unstable(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(BETA)
            || browser_version.eq_ignore_ascii_case(DEV)
            || browser_version.eq_ignore_ascii_case(NIGHTLY)
            || browser_version.eq_ignore_ascii_case(CANARY)
            || browser_version.eq_ignore_ascii_case(ESR)
    }

    fn is_browser_version_unstable(&self) -> bool {
        self.is_unstable(self.get_browser_version())
    }

    fn is_empty(&self, browser_version: &str) -> bool {
        browser_version.is_empty()
    }

    fn is_browser_version_empty(&self) -> bool {
        self.is_empty(self.get_browser_version())
    }

    fn is_stable(&self, browser_version: &str) -> bool {
        browser_version.eq_ignore_ascii_case(STABLE)
    }

    fn is_browser_version_stable(&self) -> bool {
        self.is_stable(self.get_browser_version())
    }

    fn is_version_specific(&self, version: &str) -> bool {
        version.contains(".")
    }

    fn is_browser_version_specific(&self) -> bool {
        self.is_version_specific(self.get_browser_version())
    }

    fn setup(&mut self) -> Result<PathBuf, Error> {
        let mut driver_in_path = None;
        let mut driver_in_path_version = None;
        let original_browser_version = self.get_config().browser_version.clone();

        // Try to find driver in PATH
        if !self.is_safari() && !self.is_grid() && !self.is_electron() {
            self.get_logger()
                .trace(format!("Checking {} in PATH", self.get_driver_name()));
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
        let use_driver_in_path = driver_in_path_version.is_some()
            && driver_in_path.is_some()
            && original_browser_version.is_empty();

        // Discover browser version (or the need to download it, if not available and possible)
        match self.discover_local_browser() {
            Ok(_) => {}
            Err(err) => self.check_error_with_driver_in_path(&use_driver_in_path, err)?,
        }

        // Download browser if necessary
        match self.download_browser_if_necessary(&original_browser_version) {
            Ok(_) => {}
            Err(err) => {
                self.set_fallback_driver_from_cache(false);
                self.check_error_with_driver_in_path(&use_driver_in_path, err)?
            }
        }

        // With the discovered browser version, discover the proper driver version using online endpoints
        if self.get_driver_version().is_empty()
            || (self.is_grid() && self.is_nightly(self.get_driver_version()))
        {
            match self.discover_driver_version() {
                Ok(driver_version) => {
                    self.set_driver_version(driver_version);
                }
                Err(err) => self.check_error_with_driver_in_path(&use_driver_in_path, err)?,
            }
        }

        // Use driver in PATH when the user has not specified any browser version
        if use_driver_in_path {
            let path = driver_in_path.unwrap();

            if self.is_skip_driver_in_path() {
                self.get_logger().debug(format!(
                    "Skipping {} in path: {}",
                    self.get_driver_name(),
                    path
                ));
            } else {
                let version = driver_in_path_version.unwrap();
                let major_version = self.get_major_version(&version)?;

                // Display warning if the discovered driver version is not the same as the driver in PATH
                if !self.get_driver_version().is_empty()
                    && !self.is_snap(self.get_browser_path())
                    && (self.is_firefox() && !version.eq(self.get_driver_version()))
                    || (!self.is_firefox() && !major_version.eq(&self.get_major_browser_version()))
                {
                    self.get_logger().warn(format!(
                        "The {} version ({}) detected in PATH at {} might not be compatible with \
                    the detected {} version ({}); currently, {} {} is recommended for {} {}.*, \
                    so it is advised to delete the driver in PATH and retry",
                        self.get_driver_name(),
                        &version,
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
        }

        // If driver was not in the PATH, try to find it in the cache
        let driver_path = self.get_driver_path_in_cache()?;
        if driver_path.exists() {
            if !self.is_safari() {
                self.get_logger().debug(format!(
                    "{} {} already in the cache",
                    self.get_driver_name(),
                    self.get_driver_version()
                ));
            }
        } else if !self.is_safari() {
            // If driver is not in the cache, download it
            self.assert_online_or_err(OFFLINE_DOWNLOAD_ERR_MSG)?;
            self.download_driver()?;
        }
        Ok(driver_path)
    }

    fn stats(&self) -> Result<(), Error> {
        if !self.is_avoid_stats() && !self.is_offline() {
            let props = Props {
                browser: self.get_browser_name().to_ascii_lowercase(),
                browser_version: self.get_browser_version().to_ascii_lowercase(),
                os: self.get_os().to_ascii_lowercase(),
                arch: self
                    .get_normalized_arch()
                    .unwrap_or(ARCH_OTHER)
                    .to_ascii_lowercase(),
                lang: self.get_language_binding().to_ascii_lowercase(),
                selenium_version: self.get_selenium_version().to_ascii_lowercase(),
            };
            let http_client = self.get_http_client().to_owned();
            let sender = self.get_sender().to_owned();
            let cache_path = self.get_cache_path()?;
            let mut metadata = get_metadata(self.get_logger(), &cache_path);
            if !is_stats_in_metadata(&metadata.stats, &props) {
                self.get_logger()
                    .debug(format!("Sending stats to Plausible: {:?}", props,));
                let stats_ttl = self.get_ttl();
                if stats_ttl > 0 {
                    metadata
                        .stats
                        .push(create_stats_metadata(&props, stats_ttl));
                    write_metadata(&metadata, self.get_logger(), cache_path);
                }
                thread::spawn(move || {
                    send_stats_to_plausible(http_client, props, sender);
                });
            }
        }
        Ok(())
    }

    fn check_error_with_driver_in_path(
        &mut self,
        is_driver_in_path: &bool,
        err: Error,
    ) -> Result<(), Error> {
        if *is_driver_in_path {
            self.get_logger().warn(format!(
                "Exception managing {}: {}",
                self.get_browser_name(),
                err
            ));
            Ok(())
        } else {
            Err(err)
        }
    }

    fn is_browser(&self, entry: &DirEntry) -> bool {
        if MACOS.is(self.get_os()) && !self.is_firefox() {
            let entry_path = path_to_string(entry.path());
            self.is_in_cache(entry, &capitalize(self.get_browser_name()))
                && entry_path.contains(".app/Contents/MacOS")
                && !entry_path.contains("Framework")
        } else {
            self.is_in_cache(entry, &self.get_browser_name_with_extension())
        }
    }

    fn is_driver(&self, entry: &DirEntry) -> bool {
        self.is_in_cache(entry, &self.get_driver_name_with_extension())
    }

    fn is_in_cache(&self, entry: &DirEntry, file_name: &str) -> bool {
        let is_file = entry.path().is_file();

        let is_file_name = entry
            .file_name()
            .to_str()
            .map(|s| {
                if MACOS.is(self.get_os()) && !self.is_firefox() {
                    s.contains(file_name)
                } else {
                    s.ends_with(file_name)
                }
            })
            .unwrap_or(false);

        let match_os = entry
            .path()
            .to_str()
            .map(|s| s.contains(self.get_platform_label()))
            .unwrap_or(false);

        is_file && is_file_name && match_os
    }

    fn is_driver_and_matches_browser_version(&self, entry: &DirEntry) -> bool {
        let match_driver_version = entry
            .path()
            .parent()
            .unwrap_or(entry.path())
            .file_name()
            .map(|s| {
                s.to_str()
                    .unwrap_or_default()
                    .starts_with(&self.get_major_browser_version())
            })
            .unwrap_or(false);

        self.is_driver(entry) && match_driver_version
    }

    fn get_browser_path_or_latest_from_cache(&self) -> String {
        let mut browser_path = self.get_browser_path().to_string();
        if browser_path.is_empty() {
            let best_browser_from_cache = &self
                .find_best_browser_from_cache()
                .unwrap_or_default()
                .unwrap_or_default();
            if best_browser_from_cache.exists() {
                self.get_logger().debug_or_warn(
                    format!(
                        "There was an error managing {}; using browser found in the cache",
                        self.get_browser_name()
                    ),
                    self.is_offline(),
                );
                browser_path = path_to_string(best_browser_from_cache);
            }
        }
        browser_path
    }

    fn find_best_browser_from_cache(&self) -> Result<Option<PathBuf>, Error> {
        let cache_path = self.get_cache_path()?.unwrap_or_default();
        find_latest_from_cache(&cache_path, |entry| self.is_browser(entry))
    }

    fn find_best_driver_from_cache(&self) -> Result<Option<PathBuf>, Error> {
        let cache_path = self.get_cache_path()?.unwrap_or_default();
        let drivers_in_cache_matching_version = collect_files_from_cache(&cache_path, |entry| {
            self.is_driver_and_matches_browser_version(entry)
        });

        // First we look for drivers in cache that matches browser version (should work for Chrome and Edge)
        if !drivers_in_cache_matching_version.is_empty() {
            Ok(Some(
                drivers_in_cache_matching_version
                    .iter()
                    .last()
                    .unwrap()
                    .to_owned(),
            ))
        } else {
            // If not available, we look for the latest available driver in the cache
            find_latest_from_cache(&cache_path, |entry| self.is_driver(entry))
        }
    }

    fn get_major_version(&self, full_version: &str) -> Result<String, Error> {
        get_index_version(full_version, 0)
    }

    fn get_minor_version(&self, full_version: &str) -> Result<String, Error> {
        get_index_version(full_version, 1)
    }

    fn get_selenium_release_version(&self) -> Result<String, Error> {
        let driver_version = self.get_driver_version();
        if driver_version.contains(SNAPSHOT) {
            return Ok(NIGHTLY.to_string());
        }

        let mut release_version = driver_version.to_string();
        if !driver_version.ends_with('0') && !self.is_nightly(driver_version) {
            // E.g.: version 4.8.1 is shipped within release 4.8.0
            let error_message = format!(
                "Wrong {} version: '{}'",
                self.get_driver_name(),
                driver_version
            );
            let index = release_version.rfind('.').ok_or(anyhow!(error_message))? + 1;
            release_version = release_version[..index].to_string();
            release_version.push('0');
        }
        Ok(format!("selenium-{release_version}"))
    }

    fn assert_online_or_err(&self, message: &str) -> Result<(), Error> {
        if self.is_offline() {
            return Err(anyhow!(format_one_arg(message, self.get_driver_name())));
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

    fn general_request_browser_version(
        &mut self,
        browser_name: &str,
    ) -> Result<Option<String>, Error> {
        let browser_version;
        let original_browser_version = self.get_config().browser_version.clone();
        let major_browser_version = self.get_major_browser_version();
        let cache_path = self.get_cache_path()?;
        let mut metadata = get_metadata(self.get_logger(), &cache_path);

        // Browser version is checked in the local metadata
        match get_browser_version_from_metadata(
            &metadata.browsers,
            browser_name,
            &major_browser_version,
        ) {
            Some(version) => {
                self.get_logger().trace(format!(
                    "Browser with valid TTL. Getting {} version from metadata",
                    browser_name
                ));
                browser_version = version;
                self.set_browser_version(browser_version.clone());
            }
            _ => {
                // If not in metadata, discover version using online endpoints
                browser_version =
                    if major_browser_version.is_empty() || self.is_browser_version_stable() {
                        self.request_latest_browser_version_from_online(&original_browser_version)?
                    } else {
                        self.request_fixed_browser_version_from_online(&original_browser_version)?
                    };

                let browser_ttl = self.get_ttl();
                if browser_ttl > 0 {
                    metadata.browsers.push(create_browser_metadata(
                        browser_name,
                        &major_browser_version,
                        &browser_version,
                        browser_ttl,
                    ));
                    write_metadata(&metadata, self.get_logger(), cache_path);
                }
            }
        }

        Ok(Some(browser_version))
    }

    fn general_discover_browser_version(
        &mut self,
        reg_key: &'static str,
        reg_version_arg: &'static str,
        cmd_version_arg: &str,
    ) -> Result<Option<String>, Error> {
        let mut browser_path = self.get_browser_path().to_string();
        if browser_path.is_empty() {
            if let Some(path) = self.detect_browser_path() {
                browser_path = path_to_string(&path);
            }
        } else if !Path::new(&browser_path).exists() {
            self.set_fallback_driver_from_cache(false);
            return Err(anyhow!(format_one_arg(
                "Browser path does not exist: {}",
                &browser_path,
            )));
        }
        let escaped_browser_path = self.get_escaped_path(browser_path.to_string());

        let mut commands = Vec::new();
        if WINDOWS.is(self.get_os()) {
            if !escaped_browser_path.is_empty() {
                return Ok(get_win_file_version(&escaped_browser_path));
            }
            if !self.is_browser_version_unstable() {
                let reg_command =
                    Command::new_multiple(vec!["REG", "QUERY", reg_key, "/v", reg_version_arg]);
                commands.push(reg_command);
            }
        } else if !escaped_browser_path.is_empty() {
            commands.push(Command::new_single(format_three_args(
                cmd_version_arg,
                "",
                &escaped_browser_path,
                "",
            )));
            commands.push(Command::new_single(format_three_args(
                cmd_version_arg,
                DOUBLE_QUOTE,
                &browser_path,
                DOUBLE_QUOTE,
            )));
            commands.push(Command::new_single(format_three_args(
                cmd_version_arg,
                SINGLE_QUOTE,
                &browser_path,
                SINGLE_QUOTE,
            )));
            commands.push(Command::new_single(format_three_args(
                cmd_version_arg,
                "",
                &browser_path,
                "",
            )));
        }

        Ok(self.detect_browser_version(commands))
    }

    fn discover_safari_version(&mut self, safari_path: String) -> Result<Option<String>, Error> {
        let mut browser_path = self.get_browser_path().to_string();
        let mut commands = Vec::new();
        if browser_path.is_empty() {
            match self.detect_browser_path() {
                Some(path) => {
                    browser_path = self.get_escaped_path(path_to_string(&path));
                }
                _ => return Ok(None),
            }
        }
        if MACOS.is(self.get_os()) {
            let plist_command = Command::new_single(format_one_arg(PLIST_COMMAND, &browser_path));
            commands.push(plist_command);
        } else {
            return Ok(None);
        }
        self.set_browser_path(safari_path);
        Ok(self.detect_browser_version(commands))
    }

    fn get_browser_path_in_cache(&self) -> Result<PathBuf, Error> {
        Ok(self
            .get_cache_path()?
            .unwrap_or_default()
            .join(self.get_browser_name())
            .join(self.get_platform_label())
            .join(self.get_browser_version()))
    }

    fn get_browser_version_label(&self) -> String {
        let major_browser_version = self.get_major_browser_version();
        if major_browser_version.is_empty() {
            "".to_string()
        } else {
            format!(" {}", major_browser_version)
        }
    }

    fn unavailable_download<T>(&self) -> Result<T, Error>
    where
        Self: Sized,
    {
        self.throw_error_message(UNAVAILABLE_DOWNLOAD_ERR_MSG)
    }

    fn unavailable_discovery<T>(&self) -> Result<T, Error>
    where
        Self: Sized,
    {
        self.throw_error_message(ONLINE_DISCOVERY_ERROR_MESSAGE)
    }

    fn throw_error_message<T>(&self, error_message: &str) -> Result<T, Error>
    where
        Self: Sized,
    {
        let browser_version = self.get_browser_version();
        let browser_version_label = if browser_version.is_empty() {
            "".to_string()
        } else {
            format!(" {}", browser_version)
        };
        Err(anyhow!(format_two_args(
            error_message,
            self.get_browser_name(),
            &browser_version_label,
        )))
    }

    // ----------------------------------------------------------
    // Getters and setters for configuration parameters
    // ----------------------------------------------------------

    fn get_os(&self) -> &str {
        self.get_config().os.as_str()
    }

    fn set_os(&mut self, os: String) {
        if !os.is_empty() {
            self.get_config_mut().os = os;
        }
    }

    fn get_arch(&self) -> &str {
        self.get_config().arch.as_str()
    }

    fn get_normalized_arch(&self) -> Result<&str, Error> {
        let arch = self.get_arch();
        if X32.is(arch) {
            Ok(ARCH_X86)
        } else if X64.is(arch) {
            Ok(ARCH_X64)
        } else if ARM64.is(arch) {
            Ok(ARCH_ARM64)
        } else if ARMV7.is(arch) {
            Ok(ARCH_ARM7L)
        } else {
            let err_msg = format!("Unsupported architecture: {}", arch);
            self.get_logger().warn(err_msg.clone());
            Err(anyhow!(err_msg))
        }
    }

    fn set_arch(&mut self, arch: String) {
        if !arch.is_empty() {
            self.get_config_mut().arch = arch;
        }
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

    fn get_driver_mirror_url(&self) -> &str {
        self.get_config().driver_mirror_url.as_str()
    }

    fn set_driver_mirror_url(&mut self, mirror_url: String) {
        if !mirror_url.is_empty() {
            self.get_config_mut().driver_mirror_url = mirror_url;
        }
    }

    fn get_browser_mirror_url(&self) -> &str {
        self.get_config().browser_mirror_url.as_str()
    }

    fn set_browser_mirror_url(&mut self, mirror_url: String) {
        if !mirror_url.is_empty() {
            self.get_config_mut().browser_mirror_url = mirror_url;
        }
    }

    fn get_driver_mirror_versions_url_or_default<'a>(&'a self, default_url: &'a str) -> String {
        let driver_mirror_url = self.get_driver_mirror_url();
        if !driver_mirror_url.is_empty() {
            let driver_versions_path = default_url.rfind('/').map(|i| &default_url[i + 1..]);
            if let Some(path) = driver_versions_path {
                let driver_mirror_versions_url = if driver_mirror_url.ends_with('/') {
                    format!("{}{}", driver_mirror_url, path)
                } else {
                    format!("{}/{}", driver_mirror_url, path)
                };
                self.get_logger().debug(format!(
                    "Using mirror URL to discover driver versions: {}",
                    driver_mirror_versions_url
                ));
                return driver_mirror_versions_url;
            }
        }
        default_url.to_string()
    }

    fn get_driver_mirror_url_or_default<'a>(&'a self, default_url: &'a str) -> String {
        self.get_url_or_default(self.get_driver_mirror_url(), default_url)
    }

    fn get_browser_mirror_url_or_default<'a>(&'a self, default_url: &'a str) -> String {
        self.get_url_or_default(self.get_browser_mirror_url(), default_url)
    }

    fn get_url_or_default<'a>(&'a self, value_url: &'a str, default_url: &'a str) -> String {
        let url = if value_url.is_empty() {
            default_url
        } else {
            value_url
        };
        if !url.ends_with('/') {
            format!("{}/", url)
        } else {
            url.to_string()
        }
    }

    fn canonicalize_path(&self, path_buf: PathBuf) -> String {
        let mut canon_path = path_to_string(&path_buf);
        if WINDOWS.is(self.get_os()) || canon_path.starts_with(UNC_PREFIX) {
            canon_path = path_to_string(
                &path_buf
                    .as_path()
                    .canonicalize()
                    .unwrap_or(path_buf.clone()),
            )
            .replace(UNC_PREFIX, "")
        }
        if !path_to_string(&path_buf).eq(&canon_path) {
            self.get_logger().trace(format!(
                "Path {} has been canonicalized to {}",
                path_buf.display(),
                canon_path
            ));
        }
        canon_path
    }

    fn get_escaped_path(&self, string_path: String) -> String {
        let mut escaped_path = string_path.clone();
        let path = Path::new(&string_path);

        if path.exists() {
            escaped_path = self.canonicalize_path(path.to_path_buf());
            if WINDOWS.is(self.get_os()) {
                escaped_path = escaped_path.replace('\\', "\\\\");
            } else {
                let escape_command =
                    Command::new_single(format_one_arg(ESCAPE_COMMAND, escaped_path.as_str()));
                escaped_path = run_shell_command("bash", "-c", escape_command).unwrap_or_default();
                if escaped_path.is_empty() {
                    escaped_path = string_path.clone();
                }
            }
        }
        if !string_path.eq(&escaped_path) {
            self.get_logger().trace(format!(
                "Path {} has been escaped to {}",
                string_path, escaped_path
            ));
        }
        escaped_path
    }

    fn get_proxy(&self) -> &str {
        self.get_config().proxy.as_str()
    }

    fn set_proxy(&mut self, proxy: String) -> Result<(), Error> {
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

    fn set_timeout(&mut self, timeout: u64) -> Result<(), Error> {
        if timeout != REQUEST_TIMEOUT_SEC {
            self.get_config_mut().timeout = timeout;
            self.get_logger()
                .debug(format!("Using timeout of {} seconds", timeout));
            self.update_http_client()?;
        }
        Ok(())
    }

    fn update_http_client(&mut self) -> Result<(), Error> {
        let proxy = self.get_proxy();
        let timeout = self.get_timeout();
        let http_client = create_http_client(timeout, proxy)?;
        self.set_http_client(http_client);
        Ok(())
    }

    fn get_ttl(&self) -> u64 {
        self.get_config().ttl
    }

    fn set_ttl(&mut self, ttl: u64) {
        self.get_config_mut().ttl = ttl;
    }

    fn is_offline(&self) -> bool {
        self.get_config().offline
    }

    fn set_offline(&mut self, offline: bool) {
        if offline {
            self.get_logger()
                .debug("Using Selenium Manager in offline mode");
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

    fn is_avoid_browser_download(&self) -> bool {
        self.get_config().avoid_browser_download
    }

    fn set_avoid_browser_download(&mut self, avoid_browser_download: bool) {
        if avoid_browser_download {
            self.get_config_mut().avoid_browser_download = true;
        }
    }

    fn is_skip_driver_in_path(&self) -> bool {
        self.get_config().skip_driver_in_path
    }

    fn set_skip_driver_in_path(&mut self, skip_driver_in_path: bool) {
        if skip_driver_in_path {
            self.get_config_mut().skip_driver_in_path = true;
        }
    }

    fn is_skip_browser_in_path(&self) -> bool {
        self.get_config().skip_browser_in_path
    }

    fn set_skip_browser_in_path(&mut self, skip_browser_in_path: bool) {
        if skip_browser_in_path {
            self.get_config_mut().skip_browser_in_path = true;
        }
    }

    fn get_cache_path(&self) -> Result<Option<PathBuf>, Error> {
        let path = Path::new(&self.get_config().cache_path);
        match create_path_if_not_exists(path) {
            Ok(_) => {
                let canon_path = self.canonicalize_path(path.to_path_buf());
                Ok(Some(Path::new(&canon_path).to_path_buf()))
            }
            Err(err) => {
                self.get_logger().warn(format!(
                    "Cache folder ({}) cannot be created: {}",
                    path.display(),
                    err
                ));
                Ok(None)
            }
        }
    }

    fn set_cache_path(&mut self, cache_path: String) {
        if !cache_path.is_empty() {
            self.get_config_mut().cache_path = cache_path;
        }
    }

    fn get_language_binding(&self) -> &str {
        self.get_config().language_binding.as_str()
    }

    fn set_language_binding(&mut self, language_binding: String) {
        if !language_binding.is_empty() {
            self.get_config_mut().language_binding = language_binding;
        }
    }

    fn get_selenium_version(&self) -> &str {
        self.get_config().selenium_version.as_str()
    }

    fn set_selenium_version(&mut self, selenium_version: String) {
        if !selenium_version.is_empty() {
            self.get_config_mut().selenium_version = selenium_version;
        }
    }

    fn is_avoid_stats(&self) -> bool {
        self.get_config().avoid_stats
    }

    fn set_avoid_stats(&mut self, avoid_stats: bool) {
        if avoid_stats {
            self.get_config_mut().avoid_stats = true;
        }
    }

    fn is_fallback_driver_from_cache(&self) -> bool {
        self.get_config().fallback_driver_from_cache
    }

    fn set_fallback_driver_from_cache(&mut self, fallback_driver_from_cache: bool) {
        self.get_config_mut().fallback_driver_from_cache = fallback_driver_from_cache;
    }
}

// ----------------------------------------------------------
// Public functions
// ----------------------------------------------------------

pub fn get_manager_by_browser(browser_name: String) -> Result<Box<dyn SeleniumManager>, Error> {
    let browser_name_lower_case = browser_name.to_ascii_lowercase();
    if browser_name_lower_case.eq(CHROME_NAME) {
        Ok(ChromeManager::new()?)
    } else if browser_name_lower_case.eq(FIREFOX_NAME) {
        Ok(FirefoxManager::new()?)
    } else if EDGE_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(EdgeManager::new_with_name(browser_name)?)
    } else if IE_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(IExplorerManager::new()?)
    } else if browser_name_lower_case.eq(SAFARI_NAME) {
        Ok(SafariManager::new()?)
    } else if SAFARITP_NAMES.contains(&browser_name_lower_case.as_str()) {
        Ok(SafariTPManager::new()?)
    } else if browser_name_lower_case.eq(ELECTRON_NAME) {
        Ok(ElectronManager::new()?)
    } else {
        Err(anyhow!(format!("Invalid browser name: {browser_name}")))
    }
}

pub fn get_manager_by_driver(driver_name: String) -> Result<Box<dyn SeleniumManager>, Error> {
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
        Err(anyhow!(format!("Invalid driver name: {driver_name}")))
    }
}

pub fn clear_cache(log: &Logger, path: &str) {
    let cache_path = Path::new(path).to_path_buf();
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

pub fn create_http_client(timeout: u64, proxy: &str) -> Result<Client, Error> {
    let mut client_builder = Client::builder()
        .danger_accept_invalid_certs(true)
        .use_rustls_tls()
        .timeout(Duration::from_secs(timeout));
    if !proxy.is_empty() {
        client_builder = client_builder.proxy(Proxy::all(proxy)?);
    }
    Ok(client_builder.build().unwrap_or_default())
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

fn get_index_version(full_version: &str, index: usize) -> Result<String, Error> {
    let version_vec: Vec<&str> = full_version.split('.').collect();
    Ok(version_vec
        .get(index)
        .ok_or(anyhow!(format!("Wrong version: {}", full_version)))?
        .to_string())
}
