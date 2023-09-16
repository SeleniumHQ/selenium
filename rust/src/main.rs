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

use std::path::PathBuf;
use std::process::exit;

use clap::Parser;

use exitcode::DATAERR;
use exitcode::OK;
use exitcode::UNAVAILABLE;
use selenium_manager::config::{BooleanKey, StringKey, CACHE_PATH_KEY};
use selenium_manager::grid::GridManager;
use selenium_manager::logger::{Logger, BROWSER_PATH, DRIVER_PATH};
use selenium_manager::REQUEST_TIMEOUT_SEC;
use selenium_manager::TTL_SEC;
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

    /// Operating system (i.e., windows, linux, or macos)
    #[clap(long, value_parser)]
    os: Option<String>,

    /// System architecture (i.e., x32, x64, or arm64)
    #[clap(long, value_parser)]
    arch: Option<String>,

    /// HTTP proxy for network connection (e.g., https://myproxy.net:8080)
    #[clap(long, value_parser)]
    proxy: Option<String>,

    /// Timeout for network requests (in seconds)
    #[clap(long, value_parser, default_value_t = REQUEST_TIMEOUT_SEC)]
    timeout: u64,

    /// TTL (time-to-live) for discovered versions (online) of drivers and browsers
    #[clap(long, value_parser, default_value_t = TTL_SEC)]
    ttl: u64,

    /// Local folder used to store downloaded assets (drivers and browsers), local metadata,
    /// and configuration file [default: ~/.cache/selenium]
    #[clap(long, value_parser)]
    cache_path: Option<String>,

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

    /// Force to download browser (even when browser is already in the system)
    #[clap(long)]
    force_browser_download: bool,

    /// Avoid to download browser (even when browser-version is specified)
    #[clap(long)]
    avoid_browser_download: bool,
}

fn main() {
    let mut cli = Cli::parse();
    let cache_path =
        StringKey(vec![CACHE_PATH_KEY], &cli.cache_path.unwrap_or_default()).get_value();

    let debug = cli.debug || BooleanKey("debug", false).get_value();
    let trace = cli.trace || BooleanKey("trace", false).get_value();
    let log = Logger::create(&cli.output, debug, trace);
    let grid = cli.grid;
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

    if cli.offline {
        if cli.force_browser_download {
            log.warn("Offline flag set, but also asked to force downloads. Honouring offline flag");
        }
        cli.force_browser_download = false;
        if !cli.avoid_browser_download {
            log.debug("Offline flag set, but also asked not to avoid browser downloads. Honouring offline flag");
        }
        cli.avoid_browser_download = true;
    }

    // Logger set first so other setters can use it
    selenium_manager.set_logger(log);
    selenium_manager.set_browser_version(cli.browser_version.unwrap_or_default());
    selenium_manager.set_driver_version(cli.driver_version.unwrap_or_default());
    selenium_manager.set_browser_path(cli.browser_path.unwrap_or_default());
    selenium_manager.set_os(cli.os.unwrap_or_default());
    selenium_manager.set_arch(cli.arch.unwrap_or_default());
    selenium_manager.set_ttl(cli.ttl);
    selenium_manager.set_force_browser_download(cli.force_browser_download);
    selenium_manager.set_avoid_browser_download(cli.avoid_browser_download);
    selenium_manager.set_cache_path(cache_path.clone());
    selenium_manager.set_offline(cli.offline);

    if cli.clear_cache || BooleanKey("clear-cache", false).get_value() {
        clear_cache(selenium_manager.get_logger(), &cache_path);
    }
    if cli.clear_metadata || BooleanKey("clear-metadata", false).get_value() {
        clear_metadata(selenium_manager.get_logger(), &cache_path);
    }

    selenium_manager
        .set_timeout(cli.timeout)
        .and_then(|_| selenium_manager.set_proxy(cli.proxy.unwrap_or_default()))
        .and_then(|_| selenium_manager.setup())
        .map(|driver_path| {
            let log = selenium_manager.get_logger();
            log_driver_and_browser_path(log, &driver_path, selenium_manager.get_browser_path());
            flush_and_exit(OK, log);
        })
        .unwrap_or_else(|err| {
            let log = selenium_manager.get_logger();
            if let Some(best_driver_from_cache) =
                selenium_manager.find_best_driver_from_cache().unwrap()
            {
                log.warn(format!(
                    "There was an error managing {} ({}); using driver found in the cache",
                    selenium_manager.get_browser_name(),
                    err
                ));
                log_driver_and_browser_path(
                    log,
                    &best_driver_from_cache,
                    selenium_manager.get_browser_path(),
                );
                flush_and_exit(OK, log);
            } else if selenium_manager.is_offline() {
                log.warn(err.to_string());
                flush_and_exit(OK, log);
            } else {
                log.error(err.to_string());
                flush_and_exit(DATAERR, log);
            }
        });
}

fn log_driver_and_browser_path(log: &Logger, driver_path: &PathBuf, browser_path: &str) {
    if driver_path.exists() {
        log.info(format!("{}{}", DRIVER_PATH, driver_path.display()));
    } else {
        log.error(format!("Driver unavailable: {}", DRIVER_PATH));
        flush_and_exit(UNAVAILABLE, log);
    }
    if !browser_path.is_empty() {
        log.info(format!("{}{}", BROWSER_PATH, browser_path));
    }
}

fn flush_and_exit(code: i32, log: &Logger) -> ! {
    log.set_code(code);
    log.flush();
    exit(code);
}
