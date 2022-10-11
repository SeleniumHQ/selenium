use std::fs;
use std::fs::File;
use std::io;
use std::path::{Path, PathBuf};
use std::path::MAIN_SEPARATOR;

use directories::BaseDirs;
use flate2::read::GzDecoder;
use regex::Regex;
use tar::Archive;
use zip::ZipArchive;

use crate::manager::OS::WINDOWS;

const CACHE_FOLDER: &str = ".cache/selenium";
const ZIP: &str = "zip";
const GZ: &str = "gz";

pub fn clear_cache() {
    let cache_path = compose_cache_folder();
    if cache_path.exists() {
        log::debug!("Clearing cache at: {}", cache_path.display());
        fs::remove_dir_all(&cache_path).unwrap();
    }
}

pub fn create_path_if_not_exists(path: &Path) {
    if !path.exists() {
        fs::create_dir_all(&path).unwrap();
    }
}

pub fn uncompress(compressed_file: &String, target: PathBuf) {
    let file = File::open(compressed_file).unwrap();
    let kind = infer::get_from_path(compressed_file).unwrap().unwrap();
    let extension = kind.extension();
    log::trace!("The detected extension of the compressed file is {}", extension);

    if extension.eq_ignore_ascii_case(ZIP) {
        unzip(file, target);
    } else if extension.eq_ignore_ascii_case(GZ) {
        untargz(file, target);
    } else {
        let error_msg = format!("Downloaded file cannot be uncompressed ({} extension)", extension);
        log::error!("{}", error_msg);
        panic!("{}", error_msg);
    }
}

pub fn untargz(file: File, target: PathBuf) {
    log::trace!("Untargz file to {}", target.display());
    let tar = GzDecoder::new(file);
    let mut archive = Archive::new(tar);
    archive.unpack(target.parent().unwrap()).unwrap();
}

pub fn unzip(file: File, target: PathBuf) {
    log::trace!("Unzipping file to {}", target.display());
    let mut archive = ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        if (file.name()).ends_with('/') {
            continue;
        } else {
            log::debug!("File extracted to {} ({} bytes)", target.display(), file.size());
            if let Some(p) = target.parent() {
                create_path_if_not_exists(p);
            }
            let mut outfile = File::create(&target).unwrap();

            // Set permissions in Unix-like systems
            #[cfg(unix)]
            {
                use std::os::unix::fs::PermissionsExt;

                fs::set_permissions(&target, fs::Permissions::from_mode(0o755)).unwrap();
            }

            io::copy(&mut file, &mut outfile).unwrap();
            break;
        }
    }
}

pub fn compose_cache_folder() -> PathBuf {
    Path::new(BaseDirs::new().unwrap().home_dir())
        .join(String::from(CACHE_FOLDER).replace('/', &MAIN_SEPARATOR.to_string()))
}

pub fn get_cache_folder() -> PathBuf {
    let cache_path = compose_cache_folder();
    create_path_if_not_exists(&cache_path);
    cache_path
}

pub fn compose_driver_path_in_cache(driver_name: &str, os: &str, arch_folder: &str, driver_version: &str) -> PathBuf {
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

pub fn parse_version(version_text: String) -> String {
    let re = Regex::new(r"[^\d^.]").unwrap();
    re.replace_all(&*version_text, "").to_string()
}