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

use std::env::consts::{ARCH, OS};
use std::error::Error;
use std::io::Write;

use clap::Parser;
use env_logger::fmt::Color;
use env_logger::Target::Stdout;
use log::Level;
use log::LevelFilter::{Debug, Info, Trace};

use crate::chrome::ChromeManager;
use crate::edge::EdgeManager;
use crate::files::clear_cache;
use crate::firefox::FirefoxManager;
use crate::manager::BrowserManager;

mod chrome;
mod downloads;
mod edge;
mod files;
mod firefox;
mod manager;
mod metadata;

/// Automated driver management for Selenium
#[derive(Parser, Debug)]
#[clap(version, about, long_about = None, help_template = "\
{name} {version}
{about-with-newline}
{usage-heading} {usage}
{all-args}")]
struct Cli {
    /// Browser name (chrome, firefox, or edge)
    #[clap(short, long, value_parser, default_value = "")]
    browser: String,

    /// Driver name (chromedriver, geckodriver, or msedgedriver)
    #[clap(short, long, value_parser, default_value = "")]
    driver: String,

    /// Driver version (e.g., 106.0.5249.61, 0.31.0, etc.)
    #[clap(short = 'v', long, value_parser, default_value = "")]
    driver_version: String,

    /// Major browser version (e.g., 105, 106, etc.)
    #[clap(short = 'B', long, value_parser, default_value = "")]
    browser_version: String,

    /// Display DEBUG messages
    #[clap(short = 'D', long)]
    debug: bool,

    /// Display TRACE messages
    #[clap(short = 'T', long)]
    trace: bool,

    /// Clear driver cache
    #[clap(short, long)]
    clear_cache: bool,
}

fn main() -> Result<(), Box<dyn Error>> {
    let cli = Cli::parse();
    setup_logging(&cli);
    let browser_name: String = cli.browser;
    let driver_name: String = cli.driver;
    let os = OS;
    let arch = ARCH;
    let browser_manager: Box<dyn BrowserManager> = if browser_name.eq_ignore_ascii_case("chrome")
        || driver_name.eq_ignore_ascii_case("chromedriver")
    {
        ChromeManager::new()
    } else if browser_name.eq_ignore_ascii_case("firefox")
        || driver_name.eq_ignore_ascii_case("geckodriver")
    {
        FirefoxManager::new()
    } else if browser_name.eq_ignore_ascii_case("edge")
        || driver_name.eq_ignore_ascii_case("msedgedriver")
    {
        EdgeManager::new()
    } else {
        return Err(format!("Invalid browser/driver name"))?;
    };

    if cli.clear_cache {
        clear_cache();
    }

    let mut driver_version = cli.driver_version;
    let mut browser_version = cli.browser_version;

    if !driver_version.is_empty() && !browser_version.is_empty() {
        log::warn!("Ignoring --browser-version (since --driver-version is also used)");
    }

    if driver_version.is_empty() {
        if browser_version.is_empty() {
            match browser_manager.get_browser_version(os) {
                Some(version) => {
                    browser_version = version;
                    log::debug!("Detected browser: {} {}", browser_name, browser_version);
                }
                None => {
                    log::warn!(
                        "The version of {} cannot be detected. Trying with latest driver version",
                        browser_name
                    );
                }
            }
        }
        driver_version = browser_manager.get_driver_version(&browser_version, os)?;
        log::debug!(
            "Required driver: {} {}",
            browser_manager.get_driver_name(),
            driver_version
        );
    }

    let driver_path = browser_manager.get_driver_path_in_cache(&driver_version, os, arch);
    if driver_path.exists() {
        log::debug!(
            "{} {} already in the cache",
            browser_manager.get_driver_name(),
            driver_version
        );
    } else {
        browser_manager.download_driver(&driver_version, os, arch)?;
    }
    log::info!("{}", driver_path.display());

    Ok(())
}

fn setup_logging(cli: &Cli) {
    let mut filter = match cli.debug {
        true => Debug,
        false => Info,
    };
    if cli.trace {
        filter = Trace
    }

    env_logger::Builder::new()
        .filter_level(filter)
        .target(Stdout)
        .format(|buf, record| {
            let mut level_style = buf.style();
            match record.level() {
                Level::Trace => level_style.set_color(Color::Cyan),
                Level::Debug => level_style.set_color(Color::Blue),
                Level::Info => level_style.set_color(Color::Green),
                Level::Warn => level_style.set_color(Color::Yellow),
                Level::Error => level_style.set_color(Color::Red).set_bold(true),
            };
            writeln!(
                buf,
                "{}\t{}",
                level_style.value(record.level()),
                record.args()
            )
        })
        .init();
}
