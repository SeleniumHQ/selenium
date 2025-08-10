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

use anyhow::Error;
use clap::Parser;
use exitcode::DATAERR;
use exitcode::OK;
use exitcode::UNAVAILABLE;
use selenium_manager::config::{BooleanKey, StringKey, CACHE_PATH_KEY};
use selenium_manager::grid::GridManager;
use selenium_manager::lock::clear_lock_if_required;
use selenium_manager::logger::{Logger, BROWSER_PATH, DRIVER_PATH};
use selenium_manager::metadata::clear_metadata;
use selenium_manager::TTL_SEC;
use selenium_manager::{
    clear_cache, get_manager_by_browser, get_manager_by_driver, SeleniumManager,
};
use selenium_manager::{REQUEST_TIMEOUT_SEC, SM_BETA_LABEL};
use std::backtrace::{Backtrace, BacktraceStatus};
use std::path::Path;
use std::process::exit;
use std::sync::mpsc::Receiver;

/// Automated driver management for Selenium
#[derive(Parser, Debug)]
#[clap(version, about, long_about = None, help_template = "\
{name} {version}
{about-with-newline}
{usage-heading} {usage}
{all-args}")]
struct Cli {
    /// Browser name (chrome, firefox, edge, iexplorer, safari, safaritp, webview2, or electron)
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

    /// Major browser version (e.g., 105, 106, etc. Also: beta, dev, canary -or nightly-,
    /// and esr -in Firefox- are accepted)
    #[clap(long, value_parser)]
    browser_version: Option<String>,

    /// Browser path (absolute) for browser version detection (e.g., /usr/bin/google-chrome,
    /// "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    /// "C:\Program Files\Google\Chrome\Application\chrome.exe")
    #[clap(long, value_parser)]
    browser_path: Option<String>,

    /// Mirror for driver repositories (e.g., https://registry.npmmirror.com/-/binary/chromedriver/)
    #[clap(long, value_parser)]
    driver_mirror_url: Option<String>,

    /// Mirror for browser repositories
    #[clap(long, value_parser)]
    browser_mirror_url: Option<String>,

    /// Output type: LOGGER (using INFO, WARN, etc.), JSON (custom JSON notation), SHELL (Unix-like),
    /// or MIXED (INFO, WARN, DEBUG, etc. to stderr and minimal JSON to stdout)
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

    /// Level for output messages. The possible values are: info, debug, trace, warn, error
    #[clap(long)]
    log_level: Option<String>,

    /// Offline mode (i.e., disabling network requests and downloads)
    #[clap(long)]
    offline: bool,

    /// Force to download browser (even when browser is already in the system)
    #[clap(long)]
    force_browser_download: bool,

    /// Avoid to download browser (even when browser-version is specified)
    #[clap(long)]
    avoid_browser_download: bool,

    /// Selenium language bindings that invokes Selenium Manager (e.g., Java, JavaScript, Python,
    /// DotNet, Ruby)
    #[clap(long)]
    language_binding: Option<String>,

    /// Avoid sends usage statistics to plausible.io
    #[clap(long)]
    avoid_stats: bool,

    /// Not using drivers found in the PATH
    #[clap(long)]
    skip_driver_in_path: bool,

    /// Not using browsers found in the PATH
    #[clap(long)]
    skip_browser_in_path: bool,
}

fn main() {
    let mut cli = Cli::parse();
    let cache_path =
        StringKey(vec![CACHE_PATH_KEY], &cli.cache_path.unwrap_or_default()).get_value();

    let debug = cli.debug || BooleanKey("debug", false).get_value();
    let trace = cli.trace || BooleanKey("trace", false).get_value();
    let log_level = StringKey(vec!["log-level"], &cli.log_level.unwrap_or_default()).get_value();
    let log = Logger::create(&cli.output, debug, trace, &log_level);
    let grid = cli.grid;
    let mut browser_name: String = cli.browser.unwrap_or_default();
    let mut driver_name: String = cli.driver.unwrap_or_default();
    if browser_name.is_empty() {
        browser_name = StringKey(vec!["browser"], "").get_value();
    }
    if driver_name.is_empty() {
        driver_name = StringKey(vec!["driver"], "").get_value();
    }

    let mut selenium_manager: Box<dyn SeleniumManager> = if !browser_name.is_empty() {
        get_manager_by_browser(browser_name).unwrap_or_else(|err| {
            log.error(&err);
            flush_and_exit(DATAERR, &log, Some(err));
        })
    } else if !driver_name.is_empty() {
        get_manager_by_driver(driver_name).unwrap_or_else(|err| {
            log.error(&err);
            flush_and_exit(DATAERR, &log, Some(err));
        })
    } else if let Some(grid_value) = &grid {
        GridManager::new(grid_value.to_string()).unwrap_or_else(|err| {
            log.error(&err);
            flush_and_exit(DATAERR, &log, Some(err));
        })
    } else {
        log.error("You need to specify a browser or driver");
        flush_and_exit(DATAERR, &log, None);
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
    selenium_manager.set_driver_mirror_url(cli.driver_mirror_url.unwrap_or_default());
    selenium_manager.set_browser_mirror_url(cli.browser_mirror_url.unwrap_or_default());
    selenium_manager.set_os(cli.os.unwrap_or_default());
    selenium_manager.set_arch(cli.arch.unwrap_or_default());
    selenium_manager.set_ttl(cli.ttl);
    selenium_manager.set_force_browser_download(cli.force_browser_download);
    selenium_manager.set_avoid_browser_download(cli.avoid_browser_download);
    selenium_manager.set_cache_path(cache_path.clone());
    selenium_manager.set_offline(cli.offline);
    selenium_manager.set_language_binding(cli.language_binding.unwrap_or_default());
    let sm_version = clap::crate_version!();
    let selenium_version = sm_version.strip_prefix(SM_BETA_LABEL).unwrap_or(sm_version);
    selenium_manager.set_selenium_version(selenium_version.to_string());
    selenium_manager.set_avoid_stats(cli.avoid_stats);
    selenium_manager.set_skip_driver_in_path(cli.skip_driver_in_path);
    selenium_manager.set_skip_browser_in_path(cli.skip_browser_in_path);

    if cli.clear_cache || BooleanKey("clear-cache", false).get_value() {
        clear_cache(selenium_manager.get_logger(), &cache_path);
    }
    if cli.clear_metadata || BooleanKey("clear-metadata", false).get_value() {
        clear_metadata(selenium_manager.get_logger(), &cache_path);
    }

    selenium_manager
        .set_timeout(cli.timeout)
        .and_then(|_| selenium_manager.set_proxy(cli.proxy.unwrap_or_default()))
        .and_then(|_| selenium_manager.stats())
        .and_then(|_| selenium_manager.setup())
        .map(|driver_path| {
            let log = selenium_manager.get_logger();
            log_driver_and_browser_path(
                log,
                &driver_path,
                &selenium_manager.get_browser_path_or_latest_from_cache(),
                selenium_manager.get_receiver(),
            );
            flush_and_exit(OK, log, None);
        })
        .unwrap_or_else(|err| {
            let log = selenium_manager.get_logger();
            if selenium_manager.is_fallback_driver_from_cache() {
                if let Some(best_driver_from_cache) =
                    selenium_manager.find_best_driver_from_cache().unwrap()
                {
                    log.debug_or_warn(
                        format!(
                            "There was an error managing {} ({}); using driver found in the cache",
                            selenium_manager.get_driver_name(),
                            err
                        ),
                        selenium_manager.is_offline(),
                    );
                    log_driver_and_browser_path(
                        log,
                        &best_driver_from_cache,
                        &selenium_manager.get_browser_path_or_latest_from_cache(),
                        selenium_manager.get_receiver(),
                    );
                    flush_and_exit(OK, log, Some(err));
                }
            }
            if selenium_manager.is_offline() {
                log.warn(&err);
                flush_and_exit(OK, log, Some(err));
            } else {
                let error_msg = log
                    .is_debug_enabled()
                    .then(|| format!("{:?}", err))
                    .unwrap_or_else(|| err.to_string());
                log.error(error_msg);
                flush_and_exit(DATAERR, log, Some(err));
            }
        });
}

fn log_driver_and_browser_path(
    log: &Logger,
    driver_path: &Path,
    browser_path: &str,
    receiver: &Receiver<String>,
) {
    if let Ok(err) = receiver.try_recv() {
        log.warn(err);
    }
    if driver_path.exists() {
        log.info(format!("{}{}", DRIVER_PATH, driver_path.display()));
    } else {
        log.error(format!("Driver unavailable: {}", driver_path.display()));
        flush_and_exit(UNAVAILABLE, log, None);
    }
    if !browser_path.is_empty() {
        log.info(format!("{}{}", BROWSER_PATH, browser_path));
    }
}

fn flush_and_exit(code: i32, log: &Logger, err: Option<Error>) -> ! {
    if let Some(error) = err {
        let backtrace = Backtrace::capture();
        let backtrace_status = backtrace.status();
        if backtrace_status == BacktraceStatus::Captured {
            log.debug(format!("Backtrace:\n{}", error.backtrace()));
        }
    }
    log.set_code(code);
    log.flush();
    clear_lock_if_required();
    exit(code);
}
