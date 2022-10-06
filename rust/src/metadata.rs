use std::fs;
use std::fs::File;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::{Deserialize, Serialize};

use crate::files::get_cache_folder;

const METADATA_FILE: &str = "selenium-manager.json";
const TTL_BROWSERS_SEC: u64 = 3600;
const TTL_DRIVERS_SEC: u64 = 86400;

#[derive(Serialize, Deserialize)]
pub struct Browser {
    pub browser_name: String,
    pub browser_version: String,
    pub browser_ttl: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Driver {
    pub browser_version: String,
    pub driver_name: String,
    pub driver_version: String,
    pub driver_ttl: u64,
}

#[derive(Serialize, Deserialize)]
pub struct Metadata {
    pub browsers: Vec<Browser>,
    pub drivers: Vec<Driver>,
}

fn get_metadata_path() -> PathBuf {
    get_cache_folder().join(METADATA_FILE)
}

fn now_unix_timestamp() -> u64 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs()
}

fn new_metadata() -> Metadata {
    log::trace!("Metadata file does not exist. Creating a new one");
    Metadata { browsers: Vec::new(), drivers: Vec::new() }
}

pub fn get_metadata() -> Metadata {
    let metadata_path = get_cache_folder().join(METADATA_FILE);
    log::trace!("Reading metadata from {}", metadata_path.display());

    if metadata_path.exists() {
        let metadata_file = File::open(&metadata_path).unwrap();
        let metadata: Metadata = match serde_json::from_reader(&metadata_file) {
            Ok::<Metadata, serde_json::Error>(mut meta)  => {
                let now = now_unix_timestamp();
                meta.browsers.retain(|b| b.browser_ttl > now);
                meta.drivers.retain(|d| d.driver_ttl > now);
                meta
            },
            Err(_e) => new_metadata(),
        };
        metadata
    } else {
        new_metadata()
    }
}

pub fn get_browser_version_from_metadata(browsers_metadata: &[Browser], browser_name: &str) -> Option<String> {
    let browser: Vec<&Browser> = browsers_metadata.iter()
        .filter(|b| b.browser_name.eq(browser_name)).collect();
    if browser.is_empty() {
        None
    } else {
        Some(browser.get(0).unwrap().browser_version.to_string())
    }
}

pub fn get_driver_version_from_metadata(drivers_metadata: &[Driver], driver_name: &str, browser_version: &str) -> Option<String> {
    let driver: Vec<&Driver> = drivers_metadata.iter()
        .filter(|d| d.driver_name.eq(driver_name) &&
            d.browser_version.eq(browser_version)).collect();
    if driver.is_empty() {
        None
    } else {
        Some(driver.get(0).unwrap().driver_version.to_string())
    }
}

pub fn create_browser_metadata(browser_name: &str, browser_version: &String) -> Browser {
    Browser {
        browser_name: browser_name.to_string(),
        browser_version: browser_version.to_string(),
        browser_ttl: now_unix_timestamp() + TTL_BROWSERS_SEC,
    }
}

pub fn create_driver_metadata(browser_version: &str, driver_name: &str, driver_version: &str) -> Driver {
    Driver {
        browser_version: browser_version.to_string(),
        driver_name: driver_name.to_string(),
        driver_version: driver_version.to_string(),
        driver_ttl: now_unix_timestamp() + TTL_DRIVERS_SEC,
    }
}

pub fn write_metadata(metadata: &Metadata) {
    let metadata_path = get_metadata_path();
    log::trace!("Writing metadata to {}", metadata_path.display());
    fs::write(metadata_path, serde_json::to_string_pretty(metadata).unwrap()).unwrap();
}
