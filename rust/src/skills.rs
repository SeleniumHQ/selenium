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

use crate::Logger;
use anyhow::{Error, anyhow};
use std::fs::OpenOptions;
use std::io::Write;
use std::path::Path;

const SKILLS_CONTENT: &str = include_str!("resources/skills.md");

pub fn write_skills_file(path: &Path, log: &Logger) -> Result<(), Error> {
    log.debug(format!("Creating skills file at: {}", path.display()));
    if path.exists() {
        return Err(anyhow!(
            "The file {} already exists. Please remove it or choose a different location.",
            path.display()
        ));
    }
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            log.debug(format!("Creating directory: {}", parent.display()));
            std::fs::create_dir_all(parent)?;
        }
    }
    let mut file = OpenOptions::new().write(true).create_new(true).open(path)?;
    file.write_all(SKILLS_CONTENT.as_bytes())?;
    Ok(())
}
