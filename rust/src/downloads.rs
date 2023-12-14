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

use crate::files::parse_version;
use crate::Logger;
use anyhow::anyhow;
use anyhow::Error;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::copy;
use std::io::Cursor;
use tempfile::{Builder, TempDir};

#[tokio::main]
pub async fn download_to_tmp_folder(
    http_client: &Client,
    url: String,
    log: &Logger,
) -> Result<(TempDir, String), Error> {
    let tmp_dir = Builder::new().prefix("selenium-manager").tempdir()?;
    log.trace(format!(
        "Downloading {} to temporal folder {:?}",
        url,
        tmp_dir.path()
    ));

    let response = http_client.get(&url).send().await?;
    let status_code = response.status();
    if status_code != StatusCode::OK {
        return Err(anyhow!(format!(
            "Unsuccessful response ({}) for URL {}",
            status_code, url
        )));
    }

    let target_path;
    let mut tmp_file = {
        let target_name = response
            .url()
            .path_segments()
            .and_then(|segments| segments.last())
            .and_then(|name| if name.is_empty() { None } else { Some(name) })
            .unwrap_or("tmp.bin");

        log.trace(format!("File to be downloaded: {}", target_name));
        let target_name = tmp_dir.path().join(target_name);
        target_path = String::from(target_name.to_str().unwrap());

        log.trace(format!(
            "File downloaded to temporal folder: {}",
            target_path
        ));
        File::create(target_name)?
    };
    let mut content = Cursor::new(response.bytes().await?);
    copy(&mut content, &mut tmp_file)?;

    Ok((tmp_dir, target_path))
}

pub fn read_version_from_link(
    http_client: &Client,
    url: &str,
    log: &Logger,
) -> Result<String, Error> {
    parse_version(read_content_from_link(http_client, url)?, log)
}

#[tokio::main]
pub async fn read_content_from_link(http_client: &Client, url: &str) -> Result<String, Error> {
    Ok(http_client.get(url).send().await?.text().await?)
}

#[tokio::main]
pub async fn read_redirect_from_link(
    http_client: &Client,
    url: String,
    log: &Logger,
) -> Result<String, Error> {
    parse_version(
        http_client.get(&url).send().await?.url().path().to_string(),
        log,
    )
}

pub fn parse_json_from_url<T>(http_client: &Client, url: &str) -> Result<T, Error>
where
    T: Serialize + for<'a> Deserialize<'a>,
{
    let content = read_content_from_link(http_client, url)?;
    match serde_json::from_str(&content) {
        Ok(json) => Ok(json),
        Err(err) => Err(anyhow!(format!(
            "Error parsing JSON from URL {} {}",
            url, err
        ))),
    }
}
