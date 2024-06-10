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

use crate::stats::Props;
use crate::Logger;
use serde::{Deserialize, Serialize};
use std::fs;
use std::fs::File;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

const METADATA_FILE_OLD: &str = "selenium-manager.json";
const METADATA_FILE: &str = "se-metadata.json";

#[derive(Serialize, Deserialize)]
pub struct Stats {
    pub browser: String,
    pub browser_version: String,
    pub os: String,
    pub arch: String,
    pub lang: String,
    pub selenium_version: String,
    pub stats_ttl: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Browser {
    pub browser_name: String,
    pub major_browser_version: String,
    pub browser_version: String,
    pub browser_ttl: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Driver {
    pub major_browser_version: String,
    pub driver_name: String,
    pub driver_version: String,
    pub driver_ttl: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    pub browsers: Vec<Browser>,
    pub drivers: Vec<Driver>,
    pub stats: Vec<Stats>,
}

fn get_metadata_path(cache_path: PathBuf) -> PathBuf {
    let old_metadata = cache_path.join(METADATA_FILE_OLD);
    if old_metadata.exists() {
        fs::remove_file(old_metadata).unwrap_or_default();
    }
    cache_path.join(METADATA_FILE)
}

pub fn now_unix_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

fn new_metadata(log: &Logger) -> Metadata {
    log.trace("Metadata file does not exist. Creating a new one".to_string());
    Metadata {
        browsers: Vec::new(),
        drivers: Vec::new(),
        stats: Vec::new(),
    }
}

pub fn get_metadata(log: &Logger, cache_path: &Option<PathBuf>) -> Metadata {
    if let Some(cache) = cache_path {
        let metadata_path = get_metadata_path(cache.clone());
        log.trace(format!("Reading metadata from {}", metadata_path.display()));

        if metadata_path.exists() {
            let metadata_file = File::open(&metadata_path).unwrap();
            let metadata: Metadata = match serde_json::from_reader(&metadata_file) {
                Ok::<Metadata, serde_json::Error>(mut meta) => {
                    let now = now_unix_timestamp();
                    meta.browsers.retain(|b| b.browser_ttl > now);
                    meta.drivers.retain(|d| d.driver_ttl > now);
                    meta.stats.retain(|s| s.stats_ttl > now);
                    meta
                }
                Err(_e) => new_metadata(log), // Empty metadata
            };
            return metadata;
        }
    }
    new_metadata(log) // Empty metadata
}

pub fn get_browser_version_from_metadata(
    browsers_metadata: &[Browser],
    browser_name: &str,
    major_browser_version: &str,
) -> Option<String> {
    let browser: Vec<&Browser> = browsers_metadata
        .iter()
        .filter(|b| {
            b.browser_name.eq(browser_name) && b.major_browser_version.eq(major_browser_version)
        })
        .collect();
    if browser.is_empty() {
        None
    } else {
        Some(browser.first().unwrap().browser_version.to_string())
    }
}

pub fn get_driver_version_from_metadata(
    drivers_metadata: &[Driver],
    driver_name: &str,
    major_browser_version: &str,
) -> Option<String> {
    let driver: Vec<&Driver> = drivers_metadata
        .iter()
        .filter(|d| {
            d.driver_name.eq(driver_name) && d.major_browser_version.eq(major_browser_version)
        })
        .collect();
    if driver.is_empty() {
        None
    } else {
        Some(driver.first().unwrap().driver_version.to_string())
    }
}

pub fn is_stats_in_metadata(stats_metadata: &[Stats], props: &Props) -> bool {
    let props: Vec<&Stats> = stats_metadata
        .iter()
        .filter(|p| {
            p.browser.eq(&props.browser)
                && p.browser_version.eq(&props.browser_version)
                && p.os.eq(&props.os)
                && p.arch.eq(&props.arch)
                && p.lang.eq(&props.lang)
                && p.selenium_version.eq(&props.selenium_version)
        })
        .collect();
    !props.is_empty()
}

pub fn create_browser_metadata(
    browser_name: &str,
    major_browser_version: &str,
    browser_version: &str,
    browser_ttl: u64,
) -> Browser {
    Browser {
        browser_name: browser_name.to_string(),
        major_browser_version: major_browser_version.to_string(),
        browser_version: browser_version.to_string(),
        browser_ttl: now_unix_timestamp() + browser_ttl,
    }
}

pub fn create_driver_metadata(
    major_browser_version: &str,
    driver_name: &str,
    driver_version: &str,
    driver_ttl: u64,
) -> Driver {
    Driver {
        major_browser_version: major_browser_version.to_string(),
        driver_name: driver_name.to_string(),
        driver_version: driver_version.to_string(),
        driver_ttl: now_unix_timestamp() + driver_ttl,
    }
}

pub fn create_stats_metadata(props: &Props, stats_ttl: u64) -> Stats {
    Stats {
        browser: props.browser.to_string(),
        browser_version: props.browser_version.to_string(),
        os: props.os.to_string(),
        arch: props.arch.to_string(),
        lang: props.lang.to_string(),
        selenium_version: props.selenium_version.to_string(),
        stats_ttl: now_unix_timestamp() + stats_ttl,
    }
}

pub fn write_metadata(metadata: &Metadata, log: &Logger, cache_path: Option<PathBuf>) {
    if let Some(cache) = cache_path {
        let metadata_path = get_metadata_path(cache.clone());
        log.trace(format!("Writing metadata to {}", metadata_path.display()));
        fs::write(
            metadata_path,
            serde_json::to_string_pretty(metadata).unwrap(),
        )
        .unwrap_or_else(|err| {
            log.warn(format!(
                "Metadata cannot be written in cache ({}): {}",
                cache.display(),
                err
            ));
        });
    }
}

pub fn clear_metadata(log: &Logger, path: &str) {
    let cache_path = Path::new(path).to_path_buf();
    let metadata_path = get_metadata_path(cache_path);
    log.debug(format!(
        "Deleting metadata file {}",
        metadata_path.display()
    ));
    fs::remove_file(metadata_path).unwrap_or_else(|err| {
        log.warn(format!("Error deleting metadata file: {}", err));
    });
}
