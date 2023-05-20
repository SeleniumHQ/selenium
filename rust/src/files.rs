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

use std::error::Error;
use std::fs;
use std::fs::File;
use std::io;
use std::path::MAIN_SEPARATOR;
use std::path::{Path, PathBuf};

use crate::config::OS;
use directories::BaseDirs;
use flate2::read::GzDecoder;
use regex::Regex;
use tar::Archive;
use zip::ZipArchive;

use crate::config::OS::WINDOWS;
use crate::Logger;

pub const PARSE_ERROR: &str = "Wrong browser/driver version";
const CACHE_FOLDER: &str = ".cache/selenium";
const ZIP: &str = "zip";
const GZ: &str = "gz";
const XML: &str = "xml";

#[derive(Hash, Eq, PartialEq, Debug)]
pub struct BrowserPath {
    os: OS,
    channel: String,
}

impl BrowserPath {
    pub fn new(os: OS, channel: &str) -> BrowserPath {
        BrowserPath {
            os,
            channel: channel.to_string(),
        }
    }
}

pub fn create_path_if_not_exists(path: &Path) {
    if !path.exists() {
        fs::create_dir_all(path).unwrap();
    }
}

pub fn uncompress(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
) -> Result<(), Box<dyn Error>> {
    let file = File::open(compressed_file)?;
    let kind = infer::get_from_path(compressed_file)?
        .ok_or(format!("Format for file {:?} cannot be inferred", file))?;
    let extension = kind.extension();
    log.trace(format!(
        "The detected extension of the compressed file is {}",
        extension
    ));

    if extension.eq_ignore_ascii_case(ZIP) {
        unzip(file, target, log)?
    } else if extension.eq_ignore_ascii_case(GZ) {
        untargz(file, target, log)?
    } else if extension.eq_ignore_ascii_case(XML) {
        log.debug(format!(
            "Wrong downloaded driver: {}",
            fs::read_to_string(compressed_file).unwrap_or_default()
        ));
        return Err(PARSE_ERROR.into());
    } else {
        return Err(format!(
            "Downloaded file cannot be uncompressed ({} extension)",
            extension
        )
        .into());
    }
    Ok(())
}

pub fn untargz(file: File, target: &Path, log: &Logger) -> Result<(), Box<dyn Error>> {
    log.trace(format!("Untargz file to {}", target.display()));
    let tar = GzDecoder::new(&file);
    let mut archive = Archive::new(tar);
    let parent_path = target
        .parent()
        .ok_or(format!("Error getting parent of {:?}", file))?;
    if !target.exists() {
        archive.unpack(parent_path)?;
    }
    Ok(())
}

pub fn unzip(file: File, target: &Path, log: &Logger) -> Result<(), Box<dyn Error>> {
    log.trace(format!("Unzipping file to {}", target.display()));
    let mut archive = ZipArchive::new(file)?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        if target.exists() {
            continue;
        }
        let target_file_name = target.file_name().unwrap().to_str().unwrap();
        if target_file_name.eq_ignore_ascii_case(file.name()) {
            log.debug(format!(
                "File extracted to {} ({} bytes)",
                target.display(),
                file.size()
            ));
            if let Some(p) = target.parent() {
                create_path_if_not_exists(p);
            }
            if !target.exists() {
                let mut outfile = File::create(&target)?;

                // Set permissions in Unix-like systems
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;

                    fs::set_permissions(&target, fs::Permissions::from_mode(0o755))?;
                }

                io::copy(&mut file, &mut outfile)?;
            }
            break;
        }
    }
    Ok(())
}

pub fn compose_cache_folder() -> PathBuf {
    if let Some(base_dirs) = BaseDirs::new() {
        return Path::new(base_dirs.home_dir())
            .join(String::from(CACHE_FOLDER).replace('/', &MAIN_SEPARATOR.to_string()));
    }
    PathBuf::new()
}

pub fn get_cache_folder() -> PathBuf {
    let cache_path = compose_cache_folder();
    create_path_if_not_exists(&cache_path);
    cache_path
}

pub fn compose_driver_path_in_cache(
    driver_name: &str,
    os: &str,
    arch_folder: &str,
    driver_version: &str,
) -> PathBuf {
    get_cache_folder()
        .join(driver_name)
        .join(arch_folder)
        .join(driver_version)
        .join(get_driver_filename(driver_name, os))
}

pub fn get_driver_filename(driver_name: &str, os: &str) -> String {
    format!("{}{}", driver_name, get_binary_extension(os))
}

pub fn get_binary_extension(os: &str) -> &str {
    if WINDOWS.is(os) {
        ".exe"
    } else {
        ""
    }
}

pub fn parse_version(version_text: String, log: &Logger) -> Result<String, Box<dyn Error>> {
    if version_text.to_ascii_lowercase().contains("error") {
        log.debug(format!("Error parsing version: {}", version_text));
        return Err(PARSE_ERROR.into());
    }
    let mut parsed_version = "".to_string();
    let re_numbers_dots = Regex::new(r"[^\d^.]")?;
    let re_versions = Regex::new(r"(?:(\d+)\.)?(?:(\d+)\.)?(?:(\d+)\.\d+)")?;
    for token in version_text.split(' ') {
        parsed_version = re_numbers_dots.replace_all(token, "").to_string();
        if re_versions.is_match(parsed_version.as_str()) {
            break;
        }
    }
    if parsed_version.ends_with('.') {
        parsed_version = parsed_version[0..parsed_version.len() - 1].to_string();
    }
    Ok(parsed_version)
}
