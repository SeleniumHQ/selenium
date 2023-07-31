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

use std::process::exit;

use clap::Parser;

use exitcode::DATAERR;
use exitcode::OK;
use exitcode::UNAVAILABLE;
use selenium_manager::config::BooleanKey;
use selenium_manager::grid::GridManager;
use selenium_manager::logger::{Logger, BROWSER_PATH, DRIVER_PATH};
use selenium_manager::REQUEST_TIMEOUT_SEC;
use selenium_manager::TTL_BROWSERS_SEC;
use selenium_manager::TTL_DRIVERS_SEC;
use selenium_manager::{
    clear_cache, get_manager_by_browser, get_manager_by_driver, SeleniumManager,
};

use selenium_manager::metadata::clear_metadata;

/// Automated driver management for Selenium
#[derive(Parser, Debug)]
#[clap(version, about, long_about = None, help_template = "\
{name} {version}
{about-with-newline}
{usage-heading} {usage}
{all-args}")]
struct Cli {
    /// Browser name (chrome, firefox, edge, iexplorer, safari, or safaritp)
    #[clap(long, value_parser)]
    browser: Option<String>,

    /// Driver name (chromedriver, geckodriver, msedgedriver, IEDriverServer, or safaridriver)
    #[clap(long, value_parser)]
    driver: Option<String>,

    /// Selenium Grid. If version is not provided, the latest version is downloaded
    #[clap(long, value_parser, num_args = 0..=1, default_missing_value = "", value_name = "GRID_VERSION")]
    grid: Option<String>,

    /// Driver version (e.g., 106.0.5249.61, 0.31.0, etc.)
    #[clap(long, value_parser)]
    driver_version: Option<String>,

    /// Major browser version (e.g., 105, 106, etc. Also: beta, dev, canary -or nightly- is accepted)
    #[clap(long, value_parser)]
    browser_version: Option<String>,

    /// Browser path (absolute) for browser version detection (e.g., /usr/bin/google-chrome,
    /// "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    /// "C:\Program Files\Google\Chrome\Application\chrome.exe")
    #[clap(long, value_parser)]
    browser_path: Option<String>,

    /// Output type: LOGGER (using INFO, WARN, etc.), JSON (custom JSON notation), or SHELL (Unix-like)
    #[clap(long, value_parser, default_value = "LOGGER")]
    output: String,

    /// HTTP proxy for network connection (e.g., https://myproxy.net:8080)
    #[clap(long, value_parser)]
    proxy: Option<String>,

    /// Timeout for network requests (in seconds)
    #[clap(long, value_parser, default_value_t = REQUEST_TIMEOUT_SEC)]
    timeout: u64,

    /// Driver TTL (time-to-live)
    #[clap(long, value_parser, default_value_t = TTL_DRIVERS_SEC)]
    driver_ttl: u64,

    /// Browser TTL (time-to-live)
    #[clap(long, value_parser, default_value_t = TTL_BROWSERS_SEC)]
    browser_ttl: u64,

    /// Clear cache folder (~/.cache/selenium)
    #[clap(long)]
    clear_cache: bool,

    /// Clear metadata file (~/.cache/selenium/selenium-manager.json)
    #[clap(long)]
    clear_metadata: bool,

    /// Display DEBUG messages
    #[clap(long)]
    debug: bool,

    /// Display TRACE messages
    #[clap(long)]
    trace: bool,

    /// Offline mode (i.e., disabling network requests and downloads)
    #[clap(long)]
    offline: bool,

    /// Force to download browser. Currently Chrome for Testing (CfT) is supported
    #[clap(long)]
    force_browser_download: bool,
}

fn main() {
    let cli = Cli::parse();
    let debug = cli.debug || BooleanKey("debug", false).get_value();
    let trace = cli.trace || BooleanKey("trace", false).get_value();
    let log = Logger::create(&cli.output, debug, trace);
    let grid = cli.grid;

    if cli.clear_cache || BooleanKey("clear-cache", false).get_value() {
        clear_cache(&log);
    }

    if cli.clear_metadata || BooleanKey("clear-metadata", false).get_value() {
        clear_metadata(&log);
    }

    let browser_name: String = cli.browser.unwrap_or_default();
    let driver_name: String = cli.driver.unwrap_or_default();

    let mut selenium_manager: Box<dyn SeleniumManager> = if !browser_name.is_empty() {
        get_manager_by_browser(browser_name).unwrap_or_else(|err| {
            log.error(err);
            flush_and_exit(DATAERR, &log);
        })
    } else if !driver_name.is_empty() {
        get_manager_by_driver(driver_name).unwrap_or_else(|err| {
            log.error(err);
            flush_and_exit(DATAERR, &log);
        })
    } else if grid.is_some() {
        GridManager::new(grid.as_ref().unwrap().to_string()).unwrap_or_else(|err| {
            log.error(err);
            flush_and_exit(DATAERR, &log);
        })
    } else {
        log.error("You need to specify a browser or driver");
        flush_and_exit(DATAERR, &log);
    };

    selenium_manager.set_logger(log);
    selenium_manager.set_browser_version(cli.browser_version.unwrap_or_default());
    selenium_manager.set_driver_version(cli.driver_version.unwrap_or_default());
    selenium_manager.set_browser_path(cli.browser_path.unwrap_or_default());
    selenium_manager.set_driver_ttl(cli.driver_ttl);
    selenium_manager.set_browser_ttl(cli.browser_ttl);
    selenium_manager.set_offline(cli.offline);
    selenium_manager.set_force_browser_download(cli.force_browser_download);

    selenium_manager
        .set_timeout(cli.timeout)
        .and_then(|_| selenium_manager.set_proxy(cli.proxy.unwrap_or_default()))
        .and_then(|_| selenium_manager.resolve_driver())
        .map(|driver_path| {
            let log = selenium_manager.get_logger();
            if driver_path.exists() {
                log.info(format!("{}{}", DRIVER_PATH, driver_path.display()));
            } else {
                log.error(format!("Driver unavailable: {}", DRIVER_PATH));
                flush_and_exit(UNAVAILABLE, log);
            }
            let browser_path = selenium_manager.get_browser_path();
            if !browser_path.is_empty() {
                log.info(format!("{}{}", BROWSER_PATH, browser_path));
            }
            flush_and_exit(OK, log);
        })
        .unwrap_or_else(|err| {
            let log = selenium_manager.get_logger();
            if selenium_manager.is_offline() {
                log.warn(err.to_string());
                flush_and_exit(OK, log);
            } else {
                log.error(err.to_string());
                flush_and_exit(DATAERR, log);
            }
        });
}

fn flush_and_exit(code: i32, log: &Logger) -> ! {
    log.set_code(code);
    log.flush();
    exit(code);
}
