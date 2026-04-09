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
use anyhow::anyhow;
use clap::{Parser, Subcommand};
use exitcode::{DATAERR, OK};
use selenium_manager::config::{BooleanKey, CACHE_PATH_KEY, StringKey};
use selenium_manager::grid::GridManager;
use selenium_manager::jre::{JavaRuntime, ensure_jre};
use selenium_manager::logger::Logger;
use selenium_manager::metadata::clear_metadata;
use selenium_manager::{
    REQUEST_TIMEOUT_SEC, SM_BETA_LABEL, SeleniumManager, TTL_SEC, clear_cache,
    get_manager_by_browser, get_manager_by_driver,
};
use serde::Serialize;
use std::process::exit;

#[derive(Parser, Debug)]
#[command(
    name = "sel",
    version,
    about = "Selenium CLI for browsers and grid installation"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand, Debug)]
enum Commands {
    /// Install browsers, drivers, and Selenium Grid artifacts
    Install(InstallArgs),

    /// Print sel version
    Version,
}

#[derive(Parser, Debug)]
struct InstallArgs {
    /// Browser name (repeat to install multiple)
    #[arg(long, value_parser)]
    browser: Vec<String>,

    /// Driver name (repeat to install multiple)
    #[arg(long, value_parser)]
    driver: Vec<String>,

    /// Selenium Grid. If version is omitted, latest is downloaded
    #[arg(long, value_parser, num_args = 0..=1, default_missing_value = "", value_name = "GRID_VERSION")]
    grid: Option<String>,

    /// Browser version requested for browser install
    #[arg(long, value_parser)]
    browser_version: Option<String>,

    /// Driver version requested for driver install
    #[arg(long, value_parser)]
    driver_version: Option<String>,

    /// Output machine-readable summary as JSON
    #[arg(long)]
    json: bool,

    /// Output type passed to internal manager logs
    #[arg(long, value_parser)]
    output: Option<String>,

    /// Operating system (windows, linux, or macos)
    #[arg(long, value_parser)]
    os: Option<String>,

    /// System architecture (x32, x64, or arm64)
    #[arg(long, value_parser)]
    arch: Option<String>,

    /// HTTP proxy for network connections
    #[arg(long, value_parser)]
    proxy: Option<String>,

    /// Timeout for network requests in seconds
    #[arg(long, value_parser, default_value_t = REQUEST_TIMEOUT_SEC)]
    timeout: u64,

    /// TTL for discovered browser/driver versions
    #[arg(long, value_parser, default_value_t = TTL_SEC)]
    ttl: u64,

    /// Local cache path for downloaded assets
    #[arg(long, value_parser)]
    cache_path: Option<String>,

    /// Clear cache folder
    #[arg(long)]
    clear_cache: bool,

    /// Clear metadata file
    #[arg(long)]
    clear_metadata: bool,

    /// Display DEBUG messages
    #[arg(long)]
    debug: bool,

    /// Display TRACE messages
    #[arg(long)]
    trace: bool,

    /// Level for output messages (info, debug, trace, warn, error)
    #[arg(long)]
    log_level: Option<String>,

    /// Disable network requests and downloads
    #[arg(long)]
    offline: bool,

    /// Avoid sending usage statistics
    #[arg(long)]
    avoid_stats: bool,

    /// Force browser download even when a browser exists in PATH
    #[arg(long)]
    force_browser_download: bool,

    /// Avoid browser download even when browser-version is provided
    #[arg(long)]
    avoid_browser_download: bool,

    /// Avoid drivers found in PATH
    #[arg(long)]
    skip_driver_in_path: bool,

    /// Avoid browsers found in PATH
    #[arg(long)]
    skip_browser_in_path: bool,

    /// Browser path override for version discovery
    #[arg(long, value_parser)]
    browser_path: Option<String>,

    /// Mirror for driver repositories
    #[arg(long, value_parser)]
    driver_mirror_url: Option<String>,

    /// Mirror for browser repositories
    #[arg(long, value_parser)]
    browser_mirror_url: Option<String>,

    /// Selenium language binding invoking the install command
    #[arg(long, value_parser)]
    language_binding: Option<String>,
}

#[derive(Debug, Serialize)]
struct InstallArtifact {
    name: String,
    version: String,
    path: String,
}

#[derive(Debug, Serialize, Default)]
struct InstallSummary {
    browsers: Vec<InstallArtifact>,
    drivers: Vec<InstallArtifact>,
    grid: Option<InstallArtifact>,
    jre: Option<InstallArtifact>,
}

fn main() {
    let cli = Cli::parse();

    let code = match cli.command {
        Commands::Version => {
            println!("{}", clap::crate_version!());
            OK
        }
        Commands::Install(args) => match run_install(args) {
            Ok(()) => OK,
            Err(err) => {
                eprintln!("{}", err);
                DATAERR
            }
        },
    };

    exit(code);
}

fn run_install(args: InstallArgs) -> Result<(), Error> {
    if args.browser.is_empty() && args.driver.is_empty() && args.grid.is_none() {
        return Err(anyhow!(
            "No install target provided. Use --browser, --driver, and/or --grid"
        ));
    }

    let cache_path = StringKey(vec![CACHE_PATH_KEY], &args.cache_path.clone().unwrap_or_default())
        .get_value();

    let output = args
        .output
        .clone()
        .unwrap_or_else(|| if args.json { "MIXED" } else { "LOGGER" }.to_string());

    let debug = args.debug || BooleanKey("debug", false).get_value();
    let trace = args.trace || BooleanKey("trace", false).get_value();
    let log_level =
        StringKey(vec!["log-level"], &args.log_level.clone().unwrap_or_default()).get_value();
    let log = Logger::create(&output, debug, trace, &log_level);

    if args.clear_cache || BooleanKey("clear-cache", false).get_value() {
        clear_cache(&log, &cache_path);
    }
    if args.clear_metadata || BooleanKey("clear-metadata", false).get_value() {
        clear_metadata(&log, &cache_path);
    }

    let mut summary = InstallSummary::default();

    for browser in &args.browser {
        let mut manager = get_manager_by_browser(browser.to_string())?;
        setup_manager(
            manager.as_mut(),
            &args,
            &cache_path,
            &output,
            debug,
            trace,
            &log_level,
        )?;
        let driver_path = manager.setup()?;
        let browser_path = manager.get_browser_path_or_latest_from_cache();
        summary.browsers.push(InstallArtifact {
            name: browser.to_string(),
            version: manager.get_browser_version().to_string(),
            path: browser_path,
        });
        summary.drivers.push(InstallArtifact {
            name: manager.get_driver_name().to_string(),
            version: manager.get_driver_version().to_string(),
            path: driver_path.display().to_string(),
        });
    }

    for driver in &args.driver {
        let mut manager = get_manager_by_driver(driver.to_string())?;
        setup_manager(
            manager.as_mut(),
            &args,
            &cache_path,
            &output,
            debug,
            trace,
            &log_level,
        )?;
        let driver_path = manager.setup()?;
        summary.drivers.push(InstallArtifact {
            name: driver.to_string(),
            version: manager.get_driver_version().to_string(),
            path: driver_path.display().to_string(),
        });
    }

    if let Some(grid_version) = &args.grid {
        let mut manager = GridManager::new(grid_version.to_string())?;
        setup_manager(
            manager.as_mut(),
            &args,
            &cache_path,
            &output,
            debug,
            trace,
            &log_level,
        )?;
        let grid_path = manager.setup()?;
        summary.grid = Some(InstallArtifact {
            name: "selenium-server".to_string(),
            version: manager.get_driver_version().to_string(),
            path: grid_path.display().to_string(),
        });

        let runtime = ensure_jre(Some(cache_path.as_str()), args.timeout, args.proxy.as_deref(), &log)?;
        summary.jre = Some(java_runtime_to_artifact(runtime));
    }

    if args.json {
        println!("{}", serde_json::to_string_pretty(&summary)?);
    } else {
        print_human_summary(&summary);
    }

    Ok(())
}

fn setup_manager(
    manager: &mut dyn SeleniumManager,
    args: &InstallArgs,
    cache_path: &str,
    output: &str,
    debug: bool,
    trace: bool,
    log_level: &str,
) -> Result<(), Error> {
    let logger = Logger::create(output, debug, trace, log_level);
    manager.set_logger(logger);
    manager.set_browser_version(args.browser_version.clone().unwrap_or_default());
    manager.set_driver_version(args.driver_version.clone().unwrap_or_default());
    manager.set_browser_path(args.browser_path.clone().unwrap_or_default());
    manager.set_driver_mirror_url(args.driver_mirror_url.clone().unwrap_or_default());
    manager.set_browser_mirror_url(args.browser_mirror_url.clone().unwrap_or_default());
    manager.set_os(args.os.clone().unwrap_or_default());
    manager.set_arch(args.arch.clone().unwrap_or_default());
    manager.set_ttl(args.ttl);
    manager.set_force_browser_download(args.force_browser_download);
    manager.set_avoid_browser_download(args.avoid_browser_download);
    manager.set_cache_path(cache_path.to_string());
    manager.set_offline(args.offline);
    manager.set_language_binding(args.language_binding.clone().unwrap_or_default());
    manager.set_avoid_stats(args.avoid_stats);
    manager.set_skip_driver_in_path(args.skip_driver_in_path);
    manager.set_skip_browser_in_path(args.skip_browser_in_path);
    let sm_version = clap::crate_version!();
    let selenium_version = sm_version.strip_prefix(SM_BETA_LABEL).unwrap_or(sm_version);
    manager.set_selenium_version(selenium_version.to_string());

    manager
        .set_timeout(args.timeout)
        .and_then(|_| manager.set_proxy(args.proxy.clone().unwrap_or_default()))
        .and_then(|_| manager.stats())
}

fn java_runtime_to_artifact(runtime: JavaRuntime) -> InstallArtifact {
    InstallArtifact {
        name: runtime.source,
        version: runtime.version,
        path: runtime.java_path.display().to_string(),
    }
}

fn print_human_summary(summary: &InstallSummary) {
    for browser in &summary.browsers {
        println!(
            "Browser: {} {} -> {}",
            browser.name, browser.version, browser.path
        );
    }
    for driver in &summary.drivers {
        println!(
            "Driver: {} {} -> {}",
            driver.name, driver.version, driver.path
        );
    }
    if let Some(grid) = &summary.grid {
        println!("Grid: {} {} -> {}", grid.name, grid.version, grid.path);
    }
    if let Some(jre) = &summary.jre {
        println!("Java: {} {} -> {}", jre.name, jre.version, jre.path);
    }
}