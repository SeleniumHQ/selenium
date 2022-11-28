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

use std::collections::HashMap;
use std::error::Error;
use std::path::PathBuf;

use crate::downloads::read_content_from_link;
use crate::files::compose_driver_path_in_cache;
use crate::is_unstable;
use crate::manager::ARCH::{ARM64, X32};
use crate::manager::OS::{LINUX, MACOS, WINDOWS};
use crate::manager::{
    detect_browser_version, format_one_arg, format_two_args, BrowserManager, BrowserPath, BETA,
    DASH_DASH_VERSION, DEV, ENV_PROGRAM_FILES, ENV_PROGRAM_FILES_X86, NIGHTLY, REG_QUERY, STABLE,
    WMIC_COMMAND,
};
use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};

const BROWSER_NAME: &str = "edge";
const DRIVER_NAME: &str = "msedgedriver";
const DRIVER_URL: &str = "https://msedgedriver.azureedge.net/";
const LATEST_STABLE: &str = "LATEST_STABLE";
const LATEST_RELEASE: &str = "LATEST_RELEASE";

pub struct EdgeManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
}

impl EdgeManager {
    pub fn new() -> Box<Self> {
        Box::new(EdgeManager {
            browser_name: BROWSER_NAME,
            driver_name: DRIVER_NAME,
        })
    }
}

impl BrowserManager for EdgeManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str> {
        HashMap::from([
            (
                BrowserPath::new(WINDOWS, STABLE),
                r#"\\Microsoft\\Edge\\Application\\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, BETA),
                r#"\\Microsoft\\Edge Beta\\Application\\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, DEV),
                r#"\\Microsoft\\Edge Dev\\Application\\msedge.exe"#,
            ),
            (
                BrowserPath::new(WINDOWS, NIGHTLY),
                r#"\\Microsoft\\Edge SxS\\Application\\msedge.exe"#,
            ),
            (
                BrowserPath::new(MACOS, STABLE),
                r#"/Applications/Microsoft\ Edge.app/Contents/MacOS/Microsoft\ Edge"#,
            ),
            (
                BrowserPath::new(MACOS, BETA),
                r#"/Applications/Microsoft\ Edge\ Beta.app/Contents/MacOS/Microsoft\ Edge\ Beta"#,
            ),
            (
                BrowserPath::new(MACOS, DEV),
                r#"/Applications/Microsoft\ Edge\ Dev.app/Contents/MacOS/Microsoft\ Edge\ Dev"#,
            ),
            (
                BrowserPath::new(MACOS, NIGHTLY),
                r#"/Applications/Microsoft\ Edge\ Canary.app/Contents/MacOS/Microsoft\ Edge\ Canary"#,
            ),
            (BrowserPath::new(LINUX, STABLE), "microsoft-edge"),
            (BrowserPath::new(LINUX, BETA), "microsoft-edge-beta"),
            (BrowserPath::new(LINUX, DEV), "microsoft-edge-dev"),
        ])
    }

    fn get_browser_version(&self, os: &str, browser_version: &str) -> Option<String> {
        match self.get_browser_path(os, browser_version) {
            Some(browser_path) => {
                let (shell, flag, args) = if WINDOWS.is(os) {
                    let mut commands = vec![
                        format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES_X86, browser_path),
                        format_two_args(WMIC_COMMAND, ENV_PROGRAM_FILES, browser_path),
                    ];
                    if !is_unstable(browser_version) {
                        commands.push(format_one_arg(
                            REG_QUERY,
                            r#"REG QUERY HKCU\Software\Microsoft\Edge\BLBeacon"#,
                        ));
                    }
                    ("cmd", "/C", commands)
                } else {
                    (
                        "sh",
                        "-c",
                        vec![format_one_arg(DASH_DASH_VERSION, browser_path)],
                    )
                };
                detect_browser_version(self.browser_name, shell, flag, args)
            }
            _ => None,
        }
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn get_driver_version(
        &self,
        browser_version: &str,
        os: &str,
    ) -> Result<String, Box<dyn Error>> {
        let mut metadata = get_metadata();

        match get_driver_version_from_metadata(&metadata.drivers, self.driver_name, browser_version)
        {
            Some(driver_version) => {
                log::trace!(
                    "Driver TTL is valid. Getting {} version from metadata",
                    &self.driver_name
                );
                Ok(driver_version)
            }
            _ => {
                let driver_url = if browser_version.is_empty() {
                    format!("{}{}", DRIVER_URL, LATEST_STABLE)
                } else {
                    format!(
                        "{}{}_{}_{}",
                        DRIVER_URL,
                        LATEST_RELEASE,
                        browser_version,
                        os.to_uppercase()
                    )
                };
                log::debug!("Reading {} version from {}", &self.driver_name, driver_url);
                let driver_version = read_content_from_link(driver_url)?;

                if !browser_version.is_empty() {
                    metadata.drivers.push(create_driver_metadata(
                        browser_version,
                        self.driver_name,
                        &driver_version,
                    ));
                    write_metadata(&metadata);
                }

                Ok(driver_version)
            }
        }
    }

    fn get_driver_url(
        &self,
        driver_version: &str,
        os: &str,
        arch: &str,
    ) -> Result<String, Box<dyn Error>> {
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
            DRIVER_URL, driver_version, driver_label
        ))
    }

    fn get_driver_path_in_cache(&self, driver_version: &str, os: &str, arch: &str) -> PathBuf {
        let arch_folder = if WINDOWS.is(os) {
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
        };
        compose_driver_path_in_cache(self.driver_name, os, arch_folder, driver_version)
    }
}
