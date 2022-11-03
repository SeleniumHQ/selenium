use std::error::Error;
use std::fs::File;
use std::io::copy;
use std::io::Cursor;

use tempfile::{Builder, TempDir};

use crate::files::parse_version;

#[tokio::main]
pub async fn download_driver_to_tmp_folder(
    url: String,
) -> Result<(TempDir, String), Box<dyn Error>> {
    let tmp_dir = Builder::new().prefix("selenium-manager").tempdir()?;
    log::trace!(
        "Downloading {} to temporal folder {:?}",
        url,
        tmp_dir.path()
    );

    let response = reqwest::get(url).await?;
    let target_path;
    let mut tmp_file = {
        let target_name = response
            .url()
            .path_segments()
            .and_then(|segments| segments.last())
            .and_then(|name| if name.is_empty() { None } else { Some(name) })
            .unwrap_or("tmp.bin");

        log::trace!("File to be downloaded: {}", target_name);
        let target_name = tmp_dir.path().join(target_name);
        target_path = String::from(target_name.to_str().unwrap());

        log::trace!("Temporal folder for driver package: {}", target_path);
        File::create(target_name)?
    };
    let mut content = Cursor::new(response.bytes().await?);
    copy(&mut content, &mut tmp_file)?;

    Ok((tmp_dir, target_path))
}

#[tokio::main]
pub async fn read_content_from_link(url: String) -> Result<String, Box<dyn Error>> {
    Ok(parse_version(reqwest::get(url).await?.text().await?))
}

#[tokio::main]
pub async fn read_redirect_from_link(url: String) -> Result<String, Box<dyn Error>> {
    Ok(parse_version(
        reqwest::get(&url).await?.url().path().to_string(),
    ))
}
