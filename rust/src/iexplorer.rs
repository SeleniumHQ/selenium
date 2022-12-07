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

use crate::downloads::read_redirect_from_link;
use crate::files::compose_driver_path_in_cache;

use crate::manager::{get_minor_version, BrowserManager, BrowserPath};

use crate::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata, write_metadata,
};

const BROWSER_NAME: &str = "iexplorer";
const DRIVER_NAME: &str = "IEDriverServer";
const DRIVER_URL: &str = "https://github.com/SeleniumHQ/selenium/releases/";
const LATEST_RELEASE: &str = "latest";

pub struct IExplorerManager {
    pub browser_name: &'static str,
    pub driver_name: &'static str,
}

impl IExplorerManager {
    pub fn new() -> Box<Self> {
        Box::new(IExplorerManager {
            browser_name: BROWSER_NAME,
            driver_name: DRIVER_NAME,
        })
    }
}

impl BrowserManager for IExplorerManager {
    fn get_browser_name(&self) -> &str {
        self.browser_name
    }

    fn get_browser_path_map(&self) -> HashMap<BrowserPath, &str> {
        HashMap::new()
    }

    fn get_browser_version(&self, _os: &str, _browser_version: &str) -> Option<String> {
        None
    }

    fn get_driver_name(&self) -> &str {
        self.driver_name
    }

    fn get_driver_version(
        &self,
        browser_version: &str,
        _os: &str,
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
                let latest_url = format!("{}{}", DRIVER_URL, LATEST_RELEASE);
                let driver_version = read_redirect_from_link(latest_url)?;

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
        _os: &str,
        _arch: &str,
    ) -> Result<String, Box<dyn Error>> {
        Ok(format!(
            "{}download/selenium-{}/IEDriverServer_Win32_{}.zip",
            DRIVER_URL, driver_version, driver_version
        ))
    }

    fn get_driver_path_in_cache(&self, driver_version: &str, os: &str, _arch: &str) -> PathBuf {
        let _minor_driver_version = get_minor_version(driver_version)
            .unwrap_or_default()
            .parse::<i32>()
            .unwrap_or_default();
        compose_driver_path_in_cache(self.driver_name, os, "win32", driver_version)
    }
}
