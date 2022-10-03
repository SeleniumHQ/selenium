use std::error::Error;
use std::path::PathBuf;
use std::process::Command;

use crate::downloads::download_driver_to_tmp_folder;
use crate::files::{parse_version, uncompress};
use crate::metadata::{create_browser_metadata, get_browser_version_from_metadata, get_metadata, write_metadata};

pub trait BrowserManager {
    fn get_browser_name(&self) -> &str;

    fn get_browser_version(&self, os: &str) -> Option<String>;

    fn get_driver_name(&self) -> &str;

    fn get_driver_version(&self, browser_version: &str, os: &str) -> Result<String, Box<dyn Error>>;

    fn get_driver_url(&self, driver_version: &str, os: &str, arch: &str) -> String;

    fn get_driver_path_in_cache(&self, driver_version: &str, os: &str, arch: &str) -> PathBuf;

    fn download_driver(&self, driver_version: &str, os: &str, arch: &str) -> Result<(), Box<dyn Error>> {
        let driver_url = Self::get_driver_url(self, driver_version, os, arch);
        let (_tmp_folder, driver_zip_file) = download_driver_to_tmp_folder(driver_url)?;
        let driver_path_in_cache = Self::get_driver_path_in_cache(self, driver_version, os, arch);
        uncompress(&driver_zip_file, driver_path_in_cache);
        Ok(())
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
pub enum OS { WINDOWS, MACOS, LINUX }

impl OS {
    pub fn to_str(&self) -> &str {
        match self {
            OS::WINDOWS => "windows",
            OS::MACOS => "macos",
            OS::LINUX => "linux",
        }
    }

    pub fn is(&self, os: &str) -> bool {
        self.to_str().eq_ignore_ascii_case(os)
    }
}

#[allow(dead_code)]
#[allow(clippy::upper_case_acronyms)]
pub enum ARCH { X32, X64, ARM64 }

impl ARCH {
    pub fn to_str(&self) -> &str {
        match self {
            ARCH::X32 => "x86",
            ARCH::X64 => "x86_64",
            ARCH::ARM64 => "aarch64",
        }
    }

    pub fn is(&self, arch: &str) -> bool {
        self.to_str().eq_ignore_ascii_case(arch)
    }
}

pub fn run_shell_command(command: &str, flag: &str, args: &str) -> Result<String, Box<dyn Error>> {
    log::debug!("Running {} command: {:?}",command, args);
    let output = Command::new(command)
        .args([flag, args])
        .output()?;
    log::debug!("{:?}", output);

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

pub fn detect_browser_version(browser_name: &str, shell: &str, flag: &str, args: Vec<&str>) -> Option<String> {
    let mut metadata = get_metadata();

    match get_browser_version_from_metadata(&metadata.browsers, browser_name) {
        Some(version) => {
            log::trace!("Browser with valid TTL. Getting {} version from metadata", browser_name);
            Some(version)
        }
        _ => {
            log::debug!("Using shell command to find out {} version", browser_name);
            let mut browser_version = "".to_string();
            for arg in args.iter() {
                let output = match run_shell_command(shell, flag, *arg) {
                    Ok(out) => out,
                    Err(_e) => continue,
                };
                let full_browser_version = parse_version(output);
                if full_browser_version.is_empty() {
                    continue;
                }
                log::debug!("The version of {} is {}", browser_name, full_browser_version);
                browser_version = get_major_version(&full_browser_version);
                break;
            }

            if browser_version.is_empty() {
                None
            } else {
                metadata.browsers.push(create_browser_metadata(browser_name, &browser_version));
                write_metadata(&metadata);
                Some(browser_version)
            }
        }
    }
}

pub fn get_major_version(full_version: &str) -> String {
    let version_vec: Vec<&str> = full_version.split('.').collect();
    version_vec.first().unwrap().to_string()
}