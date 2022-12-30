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
use std::io::Write;
use std::process::exit;

use clap::Parser;
use env_logger::fmt::Color;
use env_logger::Target::Stdout;
use exitcode::DATAERR;
use Color::{Blue, Cyan, Green, Red, Yellow};

use log::Level;
use log::LevelFilter::{Debug, Info, Trace};

use selenium_manager::{
    clear_cache, get_manager_by_browser, get_manager_by_driver, SeleniumManager,
};

/// Automated driver management for Selenium
#[derive(Parser, Debug)]
#[clap(version, about, long_about = None, help_template = "\
{name} {version}
{about-with-newline}
{usage-heading} {usage}
{all-args}")]
struct Cli {
    /// Browser name (chrome, firefox, edge, or iexplorer)
    #[clap(short, long, value_parser)]
    browser: Option<String>,

    /// Driver name (chromedriver, geckodriver, msedgedriver, or IEDriverServer)
    #[clap(short, long, value_parser)]
    driver: Option<String>,

    /// Driver version (e.g., 106.0.5249.61, 0.31.0, etc.)
    #[clap(short = 'v', long, value_parser)]
    driver_version: Option<String>,

    /// Major browser version (e.g., 105, 106, etc. Also: beta, dev, canary -or nightly- is accepted)
    #[clap(short = 'B', long, value_parser)]
    browser_version: Option<String>,

    /// Browser path (absolute) for browser version detection (e.g., /usr/bin/google-chrome,
    /// "/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome",
    /// "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    #[clap(short = 'P', long, value_parser)]
    browser_path: Option<String>,

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

    if cli.clear_cache {
        clear_cache();
    }

    let browser_name: String = cli.browser.unwrap_or_default();
    let driver_name: String = cli.driver.unwrap_or_default();

    let mut selenium_manager: Box<dyn SeleniumManager> = if !browser_name.is_empty() {
        get_manager_by_browser(browser_name).unwrap_or_else(|err| {
            log::error!("{}", err);
            exit(DATAERR);
        })
    } else if !driver_name.is_empty() {
        get_manager_by_driver(driver_name).unwrap_or_else(|err| {
            log::error!("{}", err);
            exit(DATAERR);
        })
    } else {
        log::error!("You need to specify a browser or driver");
        exit(DATAERR);
    };

    selenium_manager.set_browser_version(cli.browser_version.unwrap_or_default());
    selenium_manager.set_driver_version(cli.driver_version.unwrap_or_default());
    selenium_manager.set_browser_path(cli.browser_path.unwrap_or_default());

    match selenium_manager.resolve_driver() {
        Ok(driver_path) => log::info!("{}", driver_path.display()),
        Err(err) => {
            log::error!("{}", err);
            exit(DATAERR);
        }
    };

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
                Level::Trace => level_style.set_color(Cyan),
                Level::Debug => level_style.set_color(Blue),
                Level::Info => level_style.set_color(Green),
                Level::Warn => level_style.set_color(Yellow),
                Level::Error => level_style.set_color(Red).set_bold(true),
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
