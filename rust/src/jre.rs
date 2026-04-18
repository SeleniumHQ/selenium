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

use crate::downloads::{download_to_tmp_folder, parse_json_from_url};
use crate::files::{create_path_if_not_exists, default_cache_folder, uncompress};
use crate::lock::Lock;
use crate::{Logger, create_http_client};
use anyhow::Error;
use anyhow::anyhow;
use regex::Regex;
use serde::{Deserialize, Serialize};
use std::env::consts::{ARCH, OS};
use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;
use walkdir::WalkDir;
use which::which;

const JRE_MAJOR_VERSION: &str = "21";
const MIN_SUPPORTED_JAVA_MAJOR: i32 = 11;

#[derive(Debug)]
pub struct JavaRuntime {
    pub java_path: PathBuf,
    pub version: String,
    pub source: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct AdoptiumAsset {
    binary: AdoptiumBinary,
    version_data: Option<AdoptiumVersionData>,
}

#[derive(Debug, Deserialize, Serialize)]
struct AdoptiumBinary {
    package: AdoptiumPackage,
}

#[derive(Debug, Deserialize, Serialize)]
struct AdoptiumPackage {
    link: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct AdoptiumVersionData {
    openjdk_version: Option<String>,
    semver: Option<String>,
}

pub fn ensure_jre(
    cache_path: Option<&str>,
    timeout: u64,
    proxy: Option<&str>,
    offline: bool,
    log: &Logger,
) -> Result<JavaRuntime, Error> {
    if let Some(runtime) = detect_system_java(log)? {
        return Ok(runtime);
    }

    let install_root = resolve_managed_jre_root(cache_path);
    let install_parent = install_root
        .parent()
        .ok_or_else(|| anyhow!("Failed to get parent directory of JRE install root"))?
        .to_path_buf();
    if let Some(runtime) = detect_managed_jre_candidate(&install_root)? {
        return Ok(runtime);
    }

    // Hold the lock in the stable parent directory because installation removes and
    // recreates install_root while extracting archives into the parent cache folder.
    let _lock = Lock::acquire(log, &install_parent, None)?;
    if let Some(runtime) = detect_managed_jre_candidate(&install_root)? {
        return Ok(runtime);
    }

    if offline {
        return Err(Error::msg(
            "Java not found and cannot be downloaded in offline mode",
        ));
    }

    let jre_asset = request_latest_jre_asset(timeout, proxy, log)?;

    // Remove old installation if it exists
    if install_root.exists() {
        fs::remove_dir_all(&install_root)?;
    }

    create_path_if_not_exists(&install_parent)?;

    let entries_before_uncompress = fs::read_dir(&install_parent)?
        .filter_map(|entry| entry.ok().map(|entry| entry.path()))
        .collect::<Vec<PathBuf>>();

    let http_client = create_http_client(timeout, proxy.unwrap_or_default())?;
    let (_tmp, archive) = download_to_tmp_folder(&http_client, jre_asset.binary.package.link, log)?;

    // Extract to a temporary directory first
    let temp_extract = install_parent.join(format!(
        "jre_extract_tmp_{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos()
    ));

    uncompress(&archive, &temp_extract, log, OS, None, None)?;

    // Move the extracted JRE root directory to install_root
    // Adoptium tarballs can extract into the parent directory, while some archives
    // can extract into the provided target path.
    let mut extracted_root = None;
    if temp_extract.exists() {
        if find_java_binary(&temp_extract).is_some() {
            extracted_root = Some(temp_extract.clone());
        } else {
            for entry in fs::read_dir(&temp_extract)? {
                let entry = entry?;
                let path = entry.path();
                if path.is_dir() && find_java_binary(&path).is_some() {
                    extracted_root = Some(path);
                    break;
                }
            }
        }
    }

    if extracted_root.is_none() {
        for entry in fs::read_dir(&install_parent)? {
            let entry = entry?;
            let path = entry.path();
            if path.is_dir()
                && !entries_before_uncompress.contains(&path)
                && find_java_binary(&path).is_some()
            {
                extracted_root = Some(path);
                break;
            }
        }
    }

    let extracted_root = extracted_root.ok_or_else(|| {
        anyhow!(
            "Downloaded archive did not contain expected Java runtime structure in {} or {}",
            temp_extract.display(),
            install_parent.display()
        )
    })?;

    if extracted_root != install_root {
        fs::rename(&extracted_root, &install_root)?;
    }

    // Clean up temporary extraction directory
    if temp_extract.exists() && temp_extract != install_root {
        fs::remove_dir_all(&temp_extract)?;
    }

    let runtime = detect_managed_jre_candidate(&install_root)?.ok_or_else(|| {
        anyhow!(format!(
            "Downloaded Java runtime but failed to resolve java binary in {}",
            install_root.display()
        ))
    })?;

    Ok(runtime)
}

fn detect_managed_jre_candidate(install_root: &Path) -> Result<Option<JavaRuntime>, Error> {
    if install_root.exists()
        && let Some(runtime) = detect_managed_jre(install_root)?
    {
        return Ok(Some(runtime));
    }

    if let Some(parent) = install_root.parent()
        && parent.exists()
        && let Some(runtime) = detect_managed_jre(parent)?
    {
        return Ok(Some(runtime));
    }

    Ok(None)
}

fn detect_system_java(log: &Logger) -> Result<Option<JavaRuntime>, Error> {
    let java_path = match which("java") {
        Ok(path) => path,
        Err(_) => return Ok(None),
    };

    let version = match read_java_version(&java_path)? {
        Some(version) => version,
        None => return Ok(None),
    };

    if !is_supported_java_version(&version) {
        log.debug(format!(
            "System Java found at {} but version {} is below minimum {}",
            java_path.display(),
            version,
            MIN_SUPPORTED_JAVA_MAJOR
        ));
        return Ok(None);
    }

    Ok(Some(JavaRuntime {
        java_path,
        version,
        source: "system-jre".to_string(),
    }))
}

fn detect_managed_jre(install_root: &Path) -> Result<Option<JavaRuntime>, Error> {
    let java_path = find_java_binary(install_root);
    if java_path.is_none() {
        return Ok(None);
    }
    let java_path = java_path.unwrap();

    let version = match read_java_version(&java_path)? {
        Some(version) => version,
        None => return Ok(None),
    };

    if !is_supported_java_version(&version) {
        return Ok(None);
    }

    Ok(Some(JavaRuntime {
        java_path,
        version,
        source: "managed-jre".to_string(),
    }))
}

fn request_latest_jre_asset(
    timeout: u64,
    proxy: Option<&str>,
    log: &Logger,
) -> Result<AdoptiumAsset, Error> {
    let client = create_http_client(timeout, proxy.unwrap_or_default())?;
    let os = map_os_to_adoptium(OS)?;
    let arch = map_arch_to_adoptium(ARCH)?;
    let url = format!(
        "https://api.adoptium.net/v3/assets/latest/{}/hotspot?architecture={}&heap_size=normal&image_type=jre&jvm_impl=hotspot&os={}&project=jdk&vendor=eclipse",
        JRE_MAJOR_VERSION, arch, os
    );
    let assets = parse_json_from_url::<Vec<AdoptiumAsset>>(&client, &url)?;
    if assets.is_empty() {
        return Err(anyhow!(format!("No JRE assets available in {}", url)));
    }
    let asset = assets.into_iter().next().unwrap();
    if let Some(version_data) = &asset.version_data {
        if let Some(version) = &version_data.openjdk_version {
            log.debug(format!("Selected managed JRE version {}", version));
        } else if let Some(semver) = &version_data.semver {
            log.debug(format!("Selected managed JRE semver {}", semver));
        }
    }
    Ok(asset)
}

fn resolve_managed_jre_root(cache_path: Option<&str>) -> PathBuf {
    let root = cache_path
        .map(PathBuf::from)
        .unwrap_or_else(default_cache_folder);
    root.join("jre").join(JRE_MAJOR_VERSION)
}

fn map_os_to_adoptium(os: &str) -> Result<&'static str, Error> {
    match os {
        "macos" => Ok("mac"),
        "linux" => Ok("linux"),
        "windows" => Ok("windows"),
        _ => Err(anyhow!(format!("Unsupported OS for JRE download: {}", os))),
    }
}

fn map_arch_to_adoptium(arch: &str) -> Result<&'static str, Error> {
    match arch {
        "x86_64" => Ok("x64"),
        "aarch64" => Ok("aarch64"),
        "x86" => Ok("x32"),
        _ => Err(anyhow!(format!(
            "Unsupported architecture for JRE download: {}",
            arch
        ))),
    }
}

fn find_java_binary(root: &Path) -> Option<PathBuf> {
    let java_binary = if OS == "windows" { "java.exe" } else { "java" };
    for entry in WalkDir::new(root).into_iter().flatten() {
        let path = entry.path();
        if path.is_file()
            && path
                .file_name()
                .map(|name| name.eq_ignore_ascii_case(java_binary))
                .unwrap_or(false)
            && path
                .parent()
                .and_then(|parent| parent.file_name())
                .map(|name| name.eq_ignore_ascii_case("bin"))
                .unwrap_or(false)
        {
            return Some(path.to_path_buf());
        }
    }
    None
}

fn read_java_version(java_path: &Path) -> Result<Option<String>, Error> {
    let output = Command::new(java_path).arg("-version").output()?;
    let combined_output = format!(
        "{}\n{}",
        String::from_utf8_lossy(&output.stdout),
        String::from_utf8_lossy(&output.stderr)
    );
    parse_java_version(&combined_output)
}

fn parse_java_version(output: &str) -> Result<Option<String>, Error> {
    let re = Regex::new(r#"version\s+\"([^\"]+)\""#)?;
    Ok(re
        .captures(output)
        .and_then(|captures| captures.get(1).map(|m| m.as_str().to_string())))
}

fn is_supported_java_version(version: &str) -> bool {
    parse_java_major(version)
        .map(|major| major >= MIN_SUPPORTED_JAVA_MAJOR)
        .unwrap_or(false)
}

fn parse_java_major(version: &str) -> Option<i32> {
    let mut parts = version.split('.');
    let first = parts.next()?.parse::<i32>().ok()?;
    if first == 1 {
        return parts.next()?.parse::<i32>().ok();
    }
    Some(first)
}

#[cfg(test)]
mod tests {
    use super::{
        OS, find_java_binary, is_supported_java_version, map_arch_to_adoptium, map_os_to_adoptium,
        parse_java_major, parse_java_version,
    };
    use std::fs::{self, File};
    use std::time::{SystemTime, UNIX_EPOCH};

    fn create_test_dir(prefix: &str) -> std::path::PathBuf {
        let unique = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let dir = std::env::temp_dir().join(format!("{}_{}", prefix, unique));
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn parses_java_major_versions() {
        assert_eq!(Some(8), parse_java_major("1.8.0_422"));
        assert_eq!(Some(11), parse_java_major("11.0.25"));
        assert_eq!(Some(21), parse_java_major("21.0.3"));
    }

    #[test]
    fn validates_supported_versions() {
        assert!(!is_supported_java_version("1.8.0_422"));
        assert!(is_supported_java_version("11.0.25"));
        assert!(is_supported_java_version("21.0.3"));
    }

    #[test]
    fn extracts_version_from_java_output() {
        let output = "openjdk version \"21.0.3\" 2026-04-15";
        assert_eq!(
            Some("21.0.3".to_string()),
            parse_java_version(output).unwrap()
        );
    }

    #[test]
    fn map_os_to_adoptium_returns_expected_values() {
        assert_eq!("mac", map_os_to_adoptium("macos").unwrap());
        assert_eq!("linux", map_os_to_adoptium("linux").unwrap());
        assert_eq!("windows", map_os_to_adoptium("windows").unwrap());
    }

    #[test]
    fn map_os_to_adoptium_rejects_unknown_values() {
        assert!(map_os_to_adoptium("freebsd").is_err());
        assert!(map_os_to_adoptium("unknown").is_err());
    }

    #[test]
    fn map_arch_to_adoptium_returns_expected_values() {
        assert_eq!("x64", map_arch_to_adoptium("x86_64").unwrap());
        assert_eq!("aarch64", map_arch_to_adoptium("aarch64").unwrap());
        assert_eq!("x32", map_arch_to_adoptium("x86").unwrap());
    }

    #[test]
    fn map_arch_to_adoptium_rejects_unknown_values() {
        assert!(map_arch_to_adoptium("armv7").is_err());
        assert!(map_arch_to_adoptium("unknown").is_err());
    }

    #[test]
    fn find_java_binary_detects_managed_runtime_layout() {
        let root = create_test_dir("jre_find_java_binary");
        let java_name = if OS == "windows" { "java.exe" } else { "java" };
        let java_path = root.join("jdk-21").join("bin").join(java_name);

        fs::create_dir_all(java_path.parent().unwrap()).unwrap();
        File::create(&java_path).unwrap();

        let detected = find_java_binary(&root);

        assert_eq!(detected, Some(java_path));

        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn find_java_binary_ignores_non_bin_locations() {
        let root = create_test_dir("jre_find_java_outside_bindir");
        let java_name = if OS == "windows" { "java.exe" } else { "java" };
        let java_path = root.join("jdk-21").join(java_name);

        fs::create_dir_all(java_path.parent().unwrap()).unwrap();
        File::create(&java_path).unwrap();

        let detected = find_java_binary(&root);

        assert!(detected.is_none());

        fs::remove_dir_all(&root).unwrap();
    }

    #[test]
    fn find_java_binary_picks_first_in_bin_directory() {
        let root = create_test_dir("jre_find_java_binsearch");
        let java_name = if OS == "windows" { "java.exe" } else { "java" };

        // Create two java binaries in different directories
        let java_path1 = root.join("jdk-20").join("bin").join(java_name);
        let java_path2 = root.join("jdk-21").join("bin").join(java_name);

        fs::create_dir_all(java_path1.parent().unwrap()).unwrap();
        fs::create_dir_all(java_path2.parent().unwrap()).unwrap();
        File::create(&java_path1).unwrap();
        File::create(&java_path2).unwrap();

        let detected = find_java_binary(&root);

        // Should find at least one java binary
        assert!(detected.is_some());
        let detected_path = detected.unwrap();
        assert!(detected_path.to_string_lossy().contains("bin"));
        assert!(detected_path.file_name().unwrap() == java_name);

        fs::remove_dir_all(&root).unwrap();
    }
}
