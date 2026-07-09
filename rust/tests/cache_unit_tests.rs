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
// software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
// CONDITIONS OF ANY KIND, either express or implied.  See the License
// for the specific language governing permissions and limitations
// under the License.

use selenium_manager::files::{collect_files_from_cache, find_latest_from_cache};
use selenium_manager::get_manager_by_browser;
use selenium_manager::metadata::{
    create_driver_metadata, get_driver_version_from_metadata, get_metadata,
    should_cache_driver_version, write_metadata, Metadata,
};
use selenium_manager::SeleniumManager;

use rstest::rstest;
use std::fs;
use std::path::PathBuf;
use tempfile::tempdir;
use walkdir::WalkDir;

fn create_driver_in_cache(
    cache: &PathBuf,
    driver_name: &str,
    version: &str,
) {
    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    let platform = manager.get_platform_label().to_string();
    let os = manager.get_os().to_string();
    let ext = if selenium_manager::config::OS::WINDOWS.is(&os) {
        ".exe"
    } else {
        ""
    };
    let dir = cache
        .join(driver_name)
        .join(os)
        .join(&platform)
        .join(version);
    fs::create_dir_all(&dir).unwrap();
    fs::write(
        dir.join(format!("{}{}", driver_name, ext)),
        b"fake binary",
    )
    .unwrap();
}

fn create_driver_in_cache_custom(
    cache: &PathBuf,
    driver_name: &str,
    os_label: &str,
    arch_label: &str,
    version: &str,
) {
    let dir = cache
        .join(driver_name)
        .join(os_label)
        .join(arch_label)
        .join(version);
    fs::create_dir_all(&dir).unwrap();
    let ext = if os_label == "windows" { ".exe" } else { "" };
    fs::write(
        dir.join(format!("{}{}", driver_name, ext)),
        b"fake binary",
    )
    .unwrap();
}

#[test]
fn find_latest_from_cache_returns_none_when_empty() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    let result = find_latest_from_cache(&cache, |_| true).unwrap();
    assert!(result.is_none());
}

#[test]
fn find_latest_from_cache_returns_matching_file() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let result = find_latest_from_cache(&cache, |entry| {
        entry
            .file_name()
            .to_str()
            .map(|s| s.contains("chromedriver"))
            .unwrap_or(false)
    })
    .unwrap();

    assert!(result.is_some());
    let path = result.unwrap();
    assert!(path.exists());
    assert!(path.to_str().unwrap().contains("chromedriver"));
}

#[test]
fn find_latest_from_cache_returns_last_when_multiple_matches() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "115.0.5790.110");
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let result = find_latest_from_cache(&cache, |entry| {
        entry
            .file_name()
            .to_str()
            .map(|s| s.contains("chromedriver"))
            .unwrap_or(false)
    })
    .unwrap();

    assert!(result.is_some());
    let path = result.unwrap();
    assert!(
        path.to_str().unwrap().contains("120.0.6099.109"),
        "expected last sorted entry to be 120.x, got: {:?}",
        path
    );
}

#[test]
fn find_latest_from_cache_lexical_sort_misorders_across_digit_boundaries() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache_custom(&cache, "chromedriver", "linux", "x86_64", "9.0.0");
    create_driver_in_cache_custom(&cache, "chromedriver", "linux", "x86_64", "10.0.0");

    let result = find_latest_from_cache(&cache, |entry| {
        entry
            .file_name()
            .to_str()
            .map(|s| s.contains("chromedriver"))
            .unwrap_or(false)
    })
    .unwrap()
    .unwrap();

    assert!(
        result.to_str().unwrap().contains("9.0.0"),
        "lexical sort puts '9' after '10'; this test documents the latent bug"
    );
}

#[test]
fn collect_files_from_cache_returns_empty_when_no_match() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let result = collect_files_from_cache(&cache, |_| false);
    assert!(result.is_empty());
}

#[test]
fn collect_files_from_cache_returns_all_matches() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "115.0.5790.110");
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let result = collect_files_from_cache(&cache, |entry| {
        entry
            .file_name()
            .to_str()
            .map(|s| s.contains("chromedriver"))
            .unwrap_or(false)
    });

    assert_eq!(result.len(), 2);
}

#[test]
fn is_driver_and_matches_browser_version_matches_major() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let mut manager = get_manager_by_browser("chrome".to_string()).unwrap();
    manager.set_browser_version("120".to_string());
    let entries: Vec<_> = WalkDir::new(&cache)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .collect();

    let matching: Vec<_> = entries
        .iter()
        .filter(|e| manager.is_driver_and_matches_browser_version(e))
        .collect();

    assert_eq!(matching.len(), 1);
}

#[test]
fn is_driver_and_matches_browser_version_empty_major_matches_all() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "115.0.5790.110");
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let manager = get_manager_by_browser("chrome".to_string()).unwrap();
    let entries: Vec<_> = WalkDir::new(&cache)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_file())
        .collect();

    let matching: Vec<_> = entries
        .iter()
        .filter(|e| manager.is_driver_and_matches_browser_version(e))
        .collect();

    assert_eq!(
        matching.len(),
        2,
        "starts_with(\"\") matches every cached driver — documents the latent bug"
    );
}

#[test]
fn find_best_driver_from_cache_returns_matching_version() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "115.0.5790.110");
    create_driver_in_cache(&cache, "chromedriver", "120.0.6099.109");

    let mut manager = get_manager_by_browser("chrome".to_string()).unwrap();
    manager.set_cache_path(cache.to_str().unwrap().to_string());
    manager.set_browser_version("120".to_string());

    let result = manager.find_best_driver_from_cache().unwrap();
    assert!(result.is_some());
    let path = result.unwrap();
    assert!(path.to_str().unwrap().contains("120.0.6099.109"));
}

#[test]
fn find_best_driver_from_cache_falls_back_to_latest_when_no_match() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    create_driver_in_cache(&cache, "chromedriver", "115.0.5790.110");

    let mut manager = get_manager_by_browser("chrome".to_string()).unwrap();
    manager.set_cache_path(cache.to_str().unwrap().to_string());
    manager.set_browser_version("130".to_string());

    let result = manager.find_best_driver_from_cache().unwrap();
    assert!(result.is_some());
    let path = result.unwrap();
    assert!(path.to_str().unwrap().contains("chromedriver"));
}

#[test]
fn find_best_driver_from_cache_returns_none_when_cache_empty() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();

    let mut manager = get_manager_by_browser("chrome".to_string()).unwrap();
    manager.set_cache_path(cache.to_str().unwrap().to_string());
    manager.set_browser_version("120".to_string());

    let result = manager.find_best_driver_from_cache().unwrap();
    assert!(result.is_none());
}

#[test]
fn empty_driver_version_is_not_cached_in_metadata() {
    let tmp = tempdir().unwrap();
    let cache = tmp.path().to_path_buf();
    let log = selenium_manager::logger::Logger::default();

    let mut metadata = Metadata {
        browsers: Vec::new(),
        drivers: Vec::new(),
        stats: Vec::new(),
        cached_assets: Vec::new(),
    };

    let major_browser_version = "120";
    let driver_name = "edgedriver";
    let driver_ttl = 3600;

    let driver_version = "";

    if should_cache_driver_version(driver_ttl, major_browser_version, driver_version) {
        metadata.drivers.push(create_driver_metadata(
            major_browser_version,
            driver_name,
            driver_version,
            driver_ttl,
        ));
        write_metadata(&metadata, &log, Some(cache.clone()));
    }

    let read_back = get_metadata(&log, &Some(cache.clone()));
    let result = get_driver_version_from_metadata(
        &read_back.drivers,
        driver_name,
        major_browser_version,
    );

    assert!(
        result.is_none(),
        "empty driver_version must not be cached in metadata — this test fails if the !driver_version.is_empty() guard is removed from should_cache_driver_version()"
    );
}
