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
use std::io::{BufReader, Cursor, Read};

use bzip2::read::BzDecoder;
use std::path::{Path, PathBuf};

use crate::config::OS;
use directories::BaseDirs;
use flate2::read::GzDecoder;
use regex::Regex;
use tar::Archive;
use tempfile::Builder;
use zip::ZipArchive;

use crate::config::OS::WINDOWS;
use crate::{
    format_one_arg, format_three_args, format_two_args, run_shell_command_by_os, Command, Logger,
    CP_VOLUME_COMMAND, HDIUTIL_ATTACH_COMMAND, HDIUTIL_DETACH_COMMAND, MACOS, MV_PAYLOAD_COMMAND,
    MV_PAYLOAD_OLD_VERSIONS_COMMAND, PKGUTIL_COMMAND,
};

pub const PARSE_ERROR: &str = "Wrong browser/driver version";
const CACHE_FOLDER: &str = ".cache/selenium";
const ZIP: &str = "zip";
const GZ: &str = "gz";
const XML: &str = "xml";
const HTML: &str = "html";
const BZ2: &str = "bz2";
const PKG: &str = "pkg";
const DMG: &str = "dmg";
const EXE: &str = "exe";
const SEVEN_ZIP_HEADER: &[u8; 6] = b"7z\xBC\xAF\x27\x1C";
const UNCOMPRESS_MACOS_ERR_MSG: &str = "{} files are only supported in macOS";

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

pub fn create_parent_path_if_not_exists(path: &Path) -> Result<(), Box<dyn Error>> {
    if let Some(p) = path.parent() {
        create_path_if_not_exists(p)?;
    }
    Ok(())
}

pub fn create_path_if_not_exists(path: &Path) -> Result<(), Box<dyn Error>> {
    if !path.exists() {
        fs::create_dir_all(path)?;
    }
    Ok(())
}

pub fn uncompress(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    os: &str,
    single_file: Option<String>,
    volume: Option<&str>,
    major_browser_version: Option<i32>,
) -> Result<(), Box<dyn Error>> {
    let mut extension = match infer::get_from_path(compressed_file)? {
        Some(kind) => kind.extension(),
        _ => {
            if compressed_file.ends_with(PKG) || compressed_file.ends_with(DMG) {
                if MACOS.is(os) {
                    PKG
                } else {
                    return Err(format_one_arg(UNCOMPRESS_MACOS_ERR_MSG, PKG).into());
                }
            } else {
                return Err(
                    format!("Format for file {} cannot be inferred", compressed_file).into(),
                );
            }
        }
    };
    if compressed_file.ends_with(DMG) {
        if MACOS.is(os) {
            extension = DMG;
        } else {
            return Err(format_one_arg(UNCOMPRESS_MACOS_ERR_MSG, DMG).into());
        }
    }
    log.trace(format!(
        "The detected extension of the compressed file is {}",
        extension
    ));

    if extension.eq_ignore_ascii_case(ZIP) {
        unzip(compressed_file, target, log, single_file)?
    } else if extension.eq_ignore_ascii_case(GZ) {
        untargz(compressed_file, target, log)?
    } else if extension.eq_ignore_ascii_case(BZ2) {
        uncompress_bz2(compressed_file, target, log)?
    } else if extension.eq_ignore_ascii_case(PKG) {
        uncompress_pkg(
            compressed_file,
            target,
            log,
            os,
            major_browser_version.unwrap_or_default(),
        )?
    } else if extension.eq_ignore_ascii_case(DMG) {
        uncompress_dmg(compressed_file, target, log, os, volume.unwrap_or_default())?
    } else if extension.eq_ignore_ascii_case(EXE) {
        uncompress_sfx(compressed_file, target, log)?
    } else if extension.eq_ignore_ascii_case(XML) || extension.eq_ignore_ascii_case(HTML) {
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

pub fn uncompress_sfx(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
) -> Result<(), Box<dyn Error>> {
    let zip_parent = Path::new(compressed_file).parent().unwrap();
    log.trace(format!(
        "Decompressing {} to {}",
        compressed_file,
        zip_parent.display()
    ));

    let file_bytes = read_bytes_from_file(compressed_file)?;
    let header = find_bytes(&file_bytes, SEVEN_ZIP_HEADER);
    let index_7z = header.ok_or("Incorrect SFX (self extracting exe) file")?;
    let file_reader = Cursor::new(&file_bytes[index_7z..]);
    sevenz_rust::decompress(file_reader, zip_parent).unwrap();

    let zip_parent_str = path_buf_to_string(zip_parent.to_path_buf());
    let target_str = path_buf_to_string(target.to_path_buf());
    let core_str = format!(r#"{}\core"#, zip_parent_str);
    log.trace(format!(
        "Moving extracted files and folders from {} to {}",
        core_str, target_str
    ));
    create_parent_path_if_not_exists(target)?;
    fs::rename(&core_str, &target_str)?;

    Ok(())
}

pub fn uncompress_pkg(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    os: &str,
    major_browser_version: i32,
) -> Result<(), Box<dyn Error>> {
    let tmp_dir = Builder::new().prefix(PKG).tempdir()?;
    let out_folder = format!(
        "{}/{}",
        path_buf_to_string(tmp_dir.path().to_path_buf()),
        PKG
    );
    let mut command = Command::new_single(format_two_args(
        PKGUTIL_COMMAND,
        compressed_file,
        &out_folder,
    ));
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    fs::create_dir_all(target)?;
    let target_folder = path_buf_to_string(target.to_path_buf());
    command = if major_browser_version == 0 || major_browser_version > 84 {
        Command::new_single(format_three_args(
            MV_PAYLOAD_COMMAND,
            &out_folder,
            PKG,
            &target_folder,
        ))
    } else {
        Command::new_single(format_two_args(
            MV_PAYLOAD_OLD_VERSIONS_COMMAND,
            &out_folder,
            &target_folder,
        ))
    };
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    Ok(())
}

pub fn uncompress_dmg(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    os: &str,
    volume: &str,
) -> Result<(), Box<dyn Error>> {
    let dmg_file_name = Path::new(compressed_file)
        .file_name()
        .unwrap_or_default()
        .to_os_string();
    log.debug(format!(
        "Mounting {} and copying content to cache",
        dmg_file_name.to_str().unwrap_or_default()
    ));
    let mut command = Command::new_single(format_one_arg(HDIUTIL_ATTACH_COMMAND, compressed_file));
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    fs::create_dir_all(target)?;
    let target_folder = path_buf_to_string(target.to_path_buf());
    command = Command::new_single(format_three_args(
        CP_VOLUME_COMMAND,
        volume,
        volume,
        &target_folder,
    ));
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    command = Command::new_single(format_one_arg(HDIUTIL_DETACH_COMMAND, volume));
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    Ok(())
}

pub fn untargz(compressed_file: &str, target: &Path, log: &Logger) -> Result<(), Box<dyn Error>> {
    log.trace(format!(
        "Untargz {} to {}",
        compressed_file,
        target.display()
    ));
    let file = File::open(compressed_file)?;
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

pub fn uncompress_bz2(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
) -> Result<(), Box<dyn Error>> {
    log.trace(format!(
        "Uncompress {} to {}",
        compressed_file,
        target.display()
    ));
    let mut bz_decoder = BzDecoder::new(File::open(compressed_file)?);
    let mut buffer: Vec<u8> = Vec::new();
    bz_decoder.read_to_end(&mut buffer)?;
    let mut archive = Archive::new(Cursor::new(buffer));
    if !target.exists() {
        for entry in archive.entries()? {
            let mut entry_decoder = entry?;
            let entry_path: PathBuf = entry_decoder.path()?.iter().skip(1).collect();
            let entry_target = target.join(entry_path);
            fs::create_dir_all(entry_target.parent().unwrap())?;
            entry_decoder.unpack(entry_target)?;
        }
    }
    Ok(())
}

pub fn unzip(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    single_file: Option<String>,
) -> Result<(), Box<dyn Error>> {
    let file = File::open(compressed_file)?;
    let compressed_path = Path::new(compressed_file);
    let tmp_path = compressed_path
        .parent()
        .unwrap_or(compressed_path)
        .to_path_buf();
    let final_path = if single_file.is_some() {
        target.parent().unwrap_or(target).to_path_buf()
    } else {
        target.to_path_buf()
    };
    log.trace(format!(
        "Unzipping {} to {}",
        compressed_file,
        final_path.display()
    ));
    let mut zip_archive = ZipArchive::new(file)?;
    let mut unzipped_files = 0;

    for i in 0..zip_archive.len() {
        let mut file = zip_archive.by_index(i)?;
        let path: PathBuf = match file.enclosed_name() {
            // This logic is required since some zip files (e.g. chromedriver 115+)
            // are zipped with a parent folder, while others (e.g. chromedriver 114-)
            // are zipped without a parent folder
            Some(p) => {
                let iter = p.iter();
                if iter.to_owned().count() > 1 {
                    iter.skip(1).collect()
                } else {
                    iter.collect()
                }
            }
            None => continue,
        };
        if file.name().ends_with('/') {
            log.trace(format!("File extracted to {}", tmp_path.display()));
            fs::create_dir_all(&tmp_path)?;
        } else {
            let target_path = tmp_path.join(path.clone());
            create_parent_path_if_not_exists(target_path.as_path())?;
            let mut outfile = File::create(&target_path)?;

            // Set permissions in Unix-like systems
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;

                if single_file.is_some() {
                    fs::set_permissions(&target_path, fs::Permissions::from_mode(0o755))?;
                } else if let Some(mode) = file.unix_mode() {
                    fs::set_permissions(&target_path, fs::Permissions::from_mode(mode))?;
                }
            }

            io::copy(&mut file, &mut outfile)?;
            unzipped_files += 1;
            log.trace(format!(
                "File extracted to {} ({} bytes)",
                target_path.display(),
                file.size()
            ));
        }
    }
    if unzipped_files == 0 {
        return Err(format!(
            "Problem uncompressing zip ({} files extracted)",
            unzipped_files
        )
        .into());
    }

    fs::remove_file(compressed_path)?;
    copy_folder_content(
        tmp_path,
        final_path,
        single_file,
        &compressed_path.to_path_buf(),
        log,
    )?;

    Ok(())
}

pub fn copy_folder_content(
    source: impl AsRef<Path>,
    destination: impl AsRef<Path>,
    single_file: Option<String>,
    avoid_path: &PathBuf,
    log: &Logger,
) -> io::Result<()> {
    fs::create_dir_all(&destination)?;
    for dir_entry in fs::read_dir(source)? {
        let entry = dir_entry?;
        let file_type = entry.file_type()?;
        let destination_path = destination.as_ref().join(entry.file_name());
        if file_type.is_file() {
            if entry.path().eq(avoid_path) {
                continue;
            }
            let target_file_name = entry
                .file_name()
                .to_os_string()
                .into_string()
                .unwrap_or_default();
            if single_file.is_none()
                || (single_file.is_some() && single_file.clone().unwrap().eq(&target_file_name))
            {
                log.trace(format!(
                    "Copying {} to {}",
                    entry.path().display(),
                    destination_path.display()
                ));
                if !destination_path.exists() {
                    fs::copy(entry.path(), destination_path)?;
                }
            }
        } else if single_file.is_none() {
            copy_folder_content(
                entry.path(),
                destination_path,
                single_file.clone(),
                avoid_path,
                log,
            )?;
        }
    }
    Ok(())
}

pub fn default_cache_folder() -> PathBuf {
    if let Some(base_dirs) = BaseDirs::new() {
        return Path::new(base_dirs.home_dir())
            .join(String::from(CACHE_FOLDER).replace('/', std::path::MAIN_SEPARATOR_STR));
    }
    PathBuf::new()
}

pub fn compose_driver_path_in_cache(
    driver_path: PathBuf,
    driver_name: &str,
    os: &str,
    arch_folder: &str,
    driver_version: &str,
) -> PathBuf {
    driver_path
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

pub fn path_buf_to_string(path_buf: PathBuf) -> String {
    path_buf.into_os_string().into_string().unwrap_or_default()
}

pub fn read_bytes_from_file(file_path: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    let file = File::open(file_path)?;
    let mut reader = BufReader::new(file);
    let mut buffer = Vec::new();
    reader.read_to_end(&mut buffer)?;
    Ok(buffer)
}

pub fn find_bytes(buffer: &[u8], bytes: &[u8]) -> Option<usize> {
    buffer
        .windows(bytes.len())
        .position(|window| window == bytes)
}
