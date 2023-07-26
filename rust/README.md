# Selenium Manager

Selenium Manager is a standalone tool that automatically manages the browser infrastructure required by Selenium (i.e., browsers and drivers). In other words, it implements the concept of the so-called _batteries included_ concept in Selenium.

## Rust installation
Selenium Manager has been implemented as a CLI (Command-Line Interface) tool using [Rust](https://www.rust-lang.org/). Therefore, to run it from the source code, you need to [install Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html). On Linux and macOS systems, this is done as follows:

```
curl https://sh.rustup.rs -sSf | sh
```

Alternatively, you can build it using [Bazel](https://bazel.build) by executing `bazel build //rust:selenium-manager` from the top-level directory of the Selenium repo (the same one where the `WORKSPACE` file is).

## Usage
Selenium Manager can be executed using Cargo as follows:

```
$ cargo run -- --help
selenium-manager 1.0.0-M4
Selenium Manager is a CLI tool that automatically manages the browser/driver infrastructure required by Selenium.

Usage: selenium-manager [OPTIONS]
Options:
      --browser <BROWSER>
          Browser name (chrome, firefox, edge, iexplorer, safari, or safaritp)
      --driver <DRIVER>
          Driver name (chromedriver, geckodriver, msedgedriver, IEDriverServer, or safaridriver)
      --grid [<GRID_VERSION>]
          Selenium Grid. If version is not provided, the latest version is downloaded
      --driver-version <DRIVER_VERSION>
          Driver version (e.g., 106.0.5249.61, 0.31.0, etc.)
      --browser-version <BROWSER_VERSION>
          Major browser version (e.g., 105, 106, etc. Also: beta, dev, canary -or nightly- is accepted)
      --browser-path <BROWSER_PATH>
          Browser path (absolute) for browser version detection (e.g., /usr/bin/google-chrome, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "C:\Program Files\Google\Chrome\Application\chrome.exe")
      --output <OUTPUT>
          Output type: LOGGER (using INFO, WARN, etc.), JSON (custom JSON notation), or SHELL (Unix-like) [default: LOGGER]
      --proxy <PROXY>
          HTTP proxy for network connection (e.g., https://myproxy.net:8080)
      --timeout <TIMEOUT>
          Timeout for network requests (in seconds) [default: 300]
      --driver-ttl <DRIVER_TTL>
          Driver TTL (time-to-live) [default: 3600]
      --browser-ttl <BROWSER_TTL>
          Browser TTL (time-to-live) [default: 3600]
      --clear-cache
          Clear cache folder (~/.cache/selenium)
      --clear-metadata
          Clear metadata file (~/.cache/selenium/selenium-manager.json)
      --debug
          Display DEBUG messages
      --trace
          Display TRACE messages
      --offline
          Offline mode (i.e., disabling network requests and downloads)
      --force-browser-download
          Force to download browser. Currently Chrome for Testing (CfT) is supported
  -h, --help
          Print help
  -V, --version
          Print version
```

For instance, the command required to manage chromedriver is the following:

```
$ cargo run -- --browser chrome
INFO	/home/boni/.cache/selenium/chromedriver/linux64/106.0.5249.61/chromedriver
```
If everything is correct, the last line contains the path to the driver (which will be used in the bindings). To get `DEBUG` traces, we can use:

```
$ cargo run -- --browser chrome --debug
DEBUG	Clearing cache at: /home/boni/.cache/selenium
DEBUG	Using shell command to find out chrome version
DEBUG	Running sh command: "google-chrome --version"
DEBUG	Output { status: ExitStatus(unix_wait_status(0)), stdout: "Google Chrome 106.0.5249.91 \n", stderr: "" }
DEBUG	The version of chrome is 106.0.5249.91
DEBUG	Detected browser: chrome 106
DEBUG	Reading chromedriver version from https://chromedriver.storage.googleapis.com/LATEST_RELEASE_106
DEBUG	starting new connection: https://chromedriver.storage.googleapis.com/
DEBUG	Required driver: chromedriver 106.0.5249.61
DEBUG	starting new connection: https://chromedriver.storage.googleapis.com/
DEBUG	File extracted to /home/boni/.cache/selenium/chromedriver/linux64/106.0.5249.61/chromedriver (13158208 bytes)
INFO	/home/boni/.cache/selenium/chromedriver/linux64/106.0.5249.61/chromedriver
```

Alternatively, you can replace `cargo run` with `bazel run //rust:selenium-manager`, for example `bazel run //rust:selenium-manager -- --browser chrome --debug`

### Windows ARM

There are issues when building on Windows ARM64. To workaround, use `cargo` with `--config Cargo.aarch64-pc-windows-msvc.toml` flag.

## Roadmap
The implementation of Selenium Manager has been planned to be incremental. In the beginning, it should be a component that each Selenium language binding can optionally use to manage the local browser infrastructure. In the mid-term, and as long as it becomes more stable and complete, it could be used as the default tool for automated browser and driver management. All in all, the milestone we propose are the following:

| **Milestone**                           | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|-----------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| M1: Driver management                   | <ul><li>Beta version of the Selenium Manager.</li> <li>Focused on driver management for Chrome, Firefox, and Edge.</li> <li>Selenium Manager compiled for Windows, Linux, and macOS (in GH Actions).</li> <li>Available in Selenium binding languages (Java, JavaScript, Python, Ruby, and C#).</li> <li>Used as a fallback for language bindings, when the driver is not found.</li> <li>Selenium Manager binaries bundled within the binding languages.</li></ul> |
| M2: Driver management for IEDriver      | <ul><li>Include driver support for IExplorer.</li> <li>Allow Selenium Manager to be used as a Rust lib crate.</li> <li>Support for browser beta/canary/dev versions (for Chrome, Firefox, Edge).</li> <li>Enhance error handling in Rust logic.</li> </ul>                                                                                                                                                                                                          |
| M3: Rich configuration                  | <ul><li>Proxy support in Selenium Manager.</li> <li>Extra configuration capabilities from binding languages to Selenium Manager (e.g., force to use a given driver version, etc.).</li></ul>                                                                                                                                                                                                                                                                        |
| M4: Browser management: Chrome/Chromium | <ul><li>Analyze how to make browser management for Chrome (or Chromium, if Chrome is not possible).</li> <li>Implement this feature in Windows, Linux, and macOS.</li></ul>                                                                                                                                                                                                                                                                                         |
| M5: Browser management: Firefox         | <ul><li>Analyze how to make browser management for Firefox.</li> <li>Implement this feature in Windows, Linux, and macOS.</li></ul>                                                                                                                                                                                                                                                                                                                                 |
| M6: Browser management: Edge            | <ul><li>Analyze how to make browser management for Edge.</li> <li>Implement this feature in Windows, Linux, and macOS.</li></ul>                                                                                                                                                                                                                                                                                                                                    |
