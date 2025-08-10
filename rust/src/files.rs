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

use crate::config::OS;
use crate::config::OS::WINDOWS;
use crate::{
    format_one_arg, format_three_args, run_shell_command_by_os, Command, Logger, CP_VOLUME_COMMAND,
    HDIUTIL_ATTACH_COMMAND, HDIUTIL_DETACH_COMMAND, MACOS, MSIEXEC_INSTALL_COMMAND,
};
use anyhow::anyhow;
use anyhow::Error;
use apple_flat_package::PkgReader;
use bzip2::read::BzDecoder;
use directories::BaseDirs;
use flate2::read::GzDecoder;
use fs_extra::dir::{move_dir, CopyOptions};
use regex::Regex;
#[cfg(windows)]
use std::ffi::OsStr;
use std::fs;
use std::fs::File;
use std::io;
use std::io::{BufReader, Cursor, Read};
#[cfg(windows)]
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};
#[cfg(windows)]
use std::ptr;
use tar::Archive;
use walkdir::{DirEntry, WalkDir};
#[cfg(windows)]
use winapi::shared::minwindef::LPVOID;
#[cfg(windows)]
use winapi::um::winver::{GetFileVersionInfoSizeW, GetFileVersionInfoW, VerQueryValueW};
use xz2::read::XzDecoder;
use zip::ZipArchive;

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
const DEB: &str = "deb";
const MSI: &str = "msi";
const XZ: &str = "xz";
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

pub fn create_parent_path_if_not_exists(path: &Path) -> Result<(), Error> {
    if let Some(p) = path.parent() {
        create_path_if_not_exists(p)?;
    }
    Ok(())
}

pub fn create_path_if_not_exists(path: &Path) -> Result<(), Error> {
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
) -> Result<(), Error> {
    let mut extension = match infer::get_from_path(compressed_file)? {
        Some(kind) => kind.extension(),
        _ => {
            if compressed_file.ends_with(PKG) || compressed_file.ends_with(DMG) {
                if MACOS.is(os) {
                    PKG
                } else {
                    return Err(anyhow!(format_one_arg(UNCOMPRESS_MACOS_ERR_MSG, PKG)));
                }
            } else {
                return Err(anyhow!(format!(
                    "Format for file {} cannot be inferred",
                    compressed_file
                )));
            }
        }
    };
    if compressed_file.ends_with(DMG) {
        if MACOS.is(os) {
            extension = DMG;
        } else {
            return Err(anyhow!(format_one_arg(UNCOMPRESS_MACOS_ERR_MSG, DMG)));
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
        uncompress_tar(
            &mut BzDecoder::new(File::open(compressed_file)?),
            target,
            log,
        )?
    } else if extension.eq_ignore_ascii_case(XZ) {
        uncompress_tar(
            &mut XzDecoder::new(File::open(compressed_file)?),
            target,
            log,
        )?
    } else if extension.eq_ignore_ascii_case(PKG) {
        uncompress_pkg(compressed_file, target, log)?
    } else if extension.eq_ignore_ascii_case(DMG) {
        uncompress_dmg(compressed_file, target, log, os, volume.unwrap_or_default())?
    } else if extension.eq_ignore_ascii_case(EXE) {
        uncompress_sfx(compressed_file, target, log)?
    } else if extension.eq_ignore_ascii_case(DEB) {
        uncompress_deb(compressed_file, target, log, volume.unwrap_or_default())?
    } else if extension.eq_ignore_ascii_case(MSI) {
        install_msi(compressed_file, log, os)?
    } else if extension.eq_ignore_ascii_case(XML) || extension.eq_ignore_ascii_case(HTML) {
        log.debug(format!(
            "Wrong downloaded driver: {}",
            fs::read_to_string(compressed_file).unwrap_or_default()
        ));
        return Err(anyhow!(PARSE_ERROR));
    } else {
        return Err(anyhow!(format!(
            "Downloaded file cannot be uncompressed ({} extension)",
            extension
        )));
    }

    Ok(())
}

pub fn uncompress_sfx(compressed_file: &str, target: &Path, log: &Logger) -> Result<(), Error> {
    let zip_parent = Path::new(compressed_file).parent().unwrap();
    log.trace(format!(
        "Decompressing {} to {}",
        compressed_file,
        zip_parent.display()
    ));

    let file_bytes = read_bytes_from_file(compressed_file)?;
    let header = find_bytes(&file_bytes, SEVEN_ZIP_HEADER);
    let index_7z = header.ok_or(anyhow!("Incorrect SFX (self extracting exe) file"))?;
    let file_reader = Cursor::new(&file_bytes[index_7z..]);
    sevenz_rust::decompress(file_reader, zip_parent).unwrap();

    let zip_parent_str = path_to_string(zip_parent);
    let core_str = format!(r"{}\core", zip_parent_str);
    move_folder_content(&core_str, target, log)?;

    Ok(())
}

pub fn move_folder_content(source: &str, target: &Path, log: &Logger) -> Result<(), Error> {
    log.trace(format!(
        "Moving files and folders from {} to {}",
        source,
        target.display()
    ));
    create_parent_path_if_not_exists(target)?;
    let mut options = CopyOptions::new();
    options.content_only = true;
    options.skip_exist = true;
    move_dir(source, target, &options)?;
    Ok(())
}

pub fn uncompress_pkg(compressed_file: &str, target: &Path, log: &Logger) -> Result<(), Error> {
    let target_path = Path::new(target);
    let mut reader = PkgReader::new(File::open(compressed_file)?)?;
    let packages = reader.component_packages()?;
    let package = packages.first().ok_or(anyhow!("Unable to extract PKG"))?;
    if let Some(mut cpio_reader) = package.payload_reader()? {
        while let Some(next) = cpio_reader.next() {
            let entry = next?;
            let name = entry.name();
            let mut file = Vec::new();
            cpio_reader.read_to_end(&mut file)?;
            let target_path_buf = target_path.join(name);
            log.trace(format!("Extracting {}", target_path_buf.display()));
            if entry.file_size() != 0 {
                let target_path = target_path_buf.as_path();
                fs::create_dir_all(target_path.parent().unwrap())?;
                fs::write(&target_path_buf, file)?;

                // Set permissions
                #[cfg(unix)]
                {
                    use std::os::unix::fs::PermissionsExt;

                    let mode = entry.mode();
                    fs::set_permissions(target_path, fs::Permissions::from_mode(mode))?;
                }
            }
        }
    }
    Ok(())
}

pub fn uncompress_dmg(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    os: &str,
    volume: &str,
) -> Result<(), Error> {
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
    let target_folder = path_to_string(target);
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

pub fn uncompress_deb(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    label: &str,
) -> Result<(), Error> {
    let zip_parent = Path::new(compressed_file).parent().unwrap();
    log.trace(format!(
        "Extracting from {} to {}",
        compressed_file,
        zip_parent.display()
    ));

    let deb_file = File::open(compressed_file)?;
    let mut deb_pkg = debpkg::DebPkg::parse(deb_file)?;
    deb_pkg.data()?.unpack(zip_parent)?;

    let zip_parent_str = path_to_string(zip_parent);
    let opt_edge_str = format!("{}/opt/microsoft/{}", zip_parent_str, label);

    // Exception due to bad symbolic link in unstable distributions. For example:
    // microsoft-edge -> /opt/microsoft/msedge-beta/microsoft-edge-beta
    if !label.eq("msedge") {
        let link = format!("{}/microsoft-edge", opt_edge_str);
        fs::remove_file(Path::new(&link)).unwrap_or_default();
    }

    move_folder_content(&opt_edge_str, target, log)?;

    Ok(())
}

pub fn install_msi(msi_file: &str, log: &Logger, os: &str) -> Result<(), Error> {
    let msi_file_name = Path::new(msi_file)
        .file_name()
        .unwrap_or_default()
        .to_os_string();
    log.debug(format!(
        "Installing {}",
        msi_file_name.to_str().unwrap_or_default()
    ));

    let command = Command::new_single(format_one_arg(MSIEXEC_INSTALL_COMMAND, msi_file));
    log.trace(format!("Running command: {}", command.display()));
    run_shell_command_by_os(os, command)?;

    Ok(())
}

pub fn untargz(compressed_file: &str, target: &Path, log: &Logger) -> Result<(), Error> {
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
        .ok_or(anyhow!(format!("Error getting parent of {:?}", file)))?;
    if !target.exists() {
        archive.unpack(parent_path)?;
    }
    Ok(())
}

pub fn uncompress_tar(decoder: &mut dyn Read, target: &Path, log: &Logger) -> Result<(), Error> {
    log.trace(format!(
        "Uncompress compressed tarball to {}",
        target.display()
    ));
    let mut buffer: Vec<u8> = Vec::new();
    decoder.read_to_end(&mut buffer)?;
    let mut archive = Archive::new(Cursor::new(buffer));
    for entry in archive.entries()? {
        let mut entry_decoder = entry?;
        let entry_path: PathBuf = entry_decoder.path()?.iter().skip(1).collect();
        let entry_target = target.join(entry_path);
        fs::create_dir_all(entry_target.parent().unwrap())?;
        entry_decoder.unpack(entry_target)?;
    }
    Ok(())
}

pub fn unzip(
    compressed_file: &str,
    target: &Path,
    log: &Logger,
    single_file: Option<String>,
) -> Result<(), Error> {
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
        return Err(anyhow!(format!(
            "Problem uncompressing zip ({} files extracted)",
            unzipped_files
        )));
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

pub fn parse_version(version_text: String, log: &Logger) -> Result<String, Error> {
    if version_text.to_ascii_lowercase().contains("error") {
        log.debug(format!("Error parsing version: {}", version_text));
        return Err(anyhow!(PARSE_ERROR));
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

pub fn path_to_string(path: &Path) -> String {
    path.to_path_buf()
        .into_os_string()
        .into_string()
        .unwrap_or_default()
}

pub fn read_bytes_from_file(file_path: &str) -> Result<Vec<u8>, Error> {
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

pub fn collect_files_from_cache<F: Fn(&DirEntry) -> bool>(
    cache_path: &PathBuf,
    filter: F,
) -> Vec<PathBuf> {
    WalkDir::new(cache_path)
        .sort_by_file_name()
        .into_iter()
        .filter_map(|entry| entry.ok())
        .filter(|entry| filter(entry))
        .map(|entry| entry.path().to_owned())
        .collect()
}

pub fn find_latest_from_cache<F: Fn(&DirEntry) -> bool>(
    cache_path: &PathBuf,
    filter: F,
) -> Result<Option<PathBuf>, Error> {
    let files_in_cache = collect_files_from_cache(cache_path, filter);
    if !files_in_cache.is_empty() {
        Ok(Some(files_in_cache.iter().last().unwrap().to_owned()))
    } else {
        Ok(None)
    }
}

pub fn capitalize(s: &str) -> String {
    let mut chars = s.chars();
    match chars.next() {
        None => String::new(),
        Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
    }
}

#[cfg(not(windows))]
pub fn get_win_file_version(_file_path: &str) -> Option<String> {
    None
}

#[cfg(windows)]
pub fn get_win_file_version(file_path: &str) -> Option<String> {
    unsafe {
        let wide_path: Vec<u16> = OsStr::new(file_path).encode_wide().chain(Some(0)).collect();

        let mut dummy = 0;
        let size = GetFileVersionInfoSizeW(wide_path.as_ptr(), &mut dummy);
        if size == 0 {
            return None;
        }

        let mut buffer: Vec<u8> = Vec::with_capacity(size as usize);
        if GetFileVersionInfoW(wide_path.as_ptr(), 0, size, buffer.as_mut_ptr() as LPVOID) == 0 {
            return None;
        }
        buffer.set_len(size as usize);

        let mut lang_and_codepage_ptr: LPVOID = ptr::null_mut();
        let mut lang_and_codepage_len: u32 = 0;

        if VerQueryValueW(
            buffer.as_ptr() as LPVOID,
            OsStr::new("\\VarFileInfo\\Translation")
                .encode_wide()
                .chain(Some(0))
                .collect::<Vec<u16>>()
                .as_ptr(),
            &mut lang_and_codepage_ptr,
            &mut lang_and_codepage_len,
        ) == 0
        {
            return None;
        }

        if lang_and_codepage_len == 0 {
            return None;
        }

        let lang_and_codepage_slice = std::slice::from_raw_parts(
            lang_and_codepage_ptr as *const u16,
            lang_and_codepage_len as usize / 2,
        );
        let lang = lang_and_codepage_slice[0];
        let codepage = lang_and_codepage_slice[1];

        let query = format!(
            "\\StringFileInfo\\{:04x}{:04x}\\ProductVersion",
            lang, codepage
        );
        let query_wide: Vec<u16> = OsStr::new(&query).encode_wide().chain(Some(0)).collect();

        let mut product_version_ptr: LPVOID = ptr::null_mut();
        let mut product_version_len: u32 = 0;

        if VerQueryValueW(
            buffer.as_ptr() as LPVOID,
            query_wide.as_ptr(),
            &mut product_version_ptr,
            &mut product_version_len,
        ) == 0
        {
            return None;
        }

        if product_version_ptr.is_null() {
            return None;
        }

        let product_version_slice = std::slice::from_raw_parts(
            product_version_ptr as *const u16,
            product_version_len as usize,
        );
        let product_version = String::from_utf16_lossy(product_version_slice);

        Some(product_version.trim_end_matches('\0').to_string())
    }
}
