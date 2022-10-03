# Selenium Manager

Selenium Manager is a standalone tool that automatically manages the browser infrastructure required by Selenium (i.e., browsers and drivers). In other words, it implements the concept of the so-called _batteries included_ concept in Selenium.

## Rust installation
Selenium Manager has been implemented as a CLI (Command-Line Interface) tool using [Rust](https://www.rust-lang.org/). Therefore, to run it from the source code, you need to [install Rust and Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html). On Linux and macOS systems, this is done as follows:

```
curl https://sh.rustup.rs -sSf | sh
```

## Usage
Selenium Manager can be executed using Cargo as follows:

```
$ cargo run -- --help
selenium-manager 1.0.0-M1
Automated driver management for Selenium

Usage: selenium-manager [OPTIONS] --browser <BROWSER>
Options:
  -b, --browser <BROWSER>  Browser type (e.g., chrome, firefox, edge)
  -v, --version <VERSION>  Major browser version (e.g., 105, 106, etc.) [default: ]
  -d, --debug              Display DEBUG messages
  -t, --trace              Display TRACE messages
  -c, --clear-cache        Clear driver cache
  -h, --help               Print help information
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

## Roadmap
The implementation of Selenium Manager has been planned to be incremental. In the beginning, it should be a component that each Selenium language binding can optionally use to manage the local browser infrastructure. In the mid-term, and as long as it becomes more stable and complete, it could be used as the default tool for automated browser and driver management. All in all, the milestone we propose are the following:

| **Milestone**                                             | **Description**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| M1: Driver management                                     | <ul><li>Initial MVP of the Selenium Manager.</li> <li>Focused on driver management for Chrome, Firefox, and Edge.</li> <li>Only compiled for a given operating system: Linux.</li> <li>Available in Selenium binding languages (Java, JavaScript, Python, Ruby, and C#).</li> <li>Used as a fallback for language bindings, when chromedriver is not found.</li> <li>Only used if the Selenium Manager is located in the local system (at `~/.cache/selenium/manager/selenium-manager`).</li></ul> |
| M2: Cross-platform driver management                      | <ul><li>Compiled and distributed Selenium Manager in Windows and macOS as well.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                          |
| M3: Browser management: Chrome/Chromium in Linux          | <ul><li>Analyze how to make browser management for Chrome (or Chromium, if Chrome is not possible) in all operating systems (Windows, macOS, Linux).</li> <li>Implement this feature in Linux.</li></ul>                                                                                                                                                                                                                                                                                           |
| M4: Cross-platform browser management for Chrome/Chromium | <ul><li>Extend the management of Chrome/Chromium to Windows and macOS.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                   |
| M5: Browser management for other browsers in Linux        | <ul><li>Analyze how to extend the browser management feature to Firefox (and, if possible, Edge) in all operating systems (Windows, macOS, Linux). <li>Implement this feature in Linux.</li></ul>                                                                                                                                                                                                                                                                                                  |
| M6: Full browser management support                       | <ul><li>Extend the management of all browsers to Windows and macOS.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                      |
| M7: Evergreen Selenium Manager                            | <ul><li>Implement the auto upgrade feature for all the operating systems.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                |
| M8: Auto-installable Selenium Manager in Linux            | <ul><li>Implement the auto installation feature for Linux.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                                               |
| M9: Cross-platform auto-installable Selenium Manager      | <ul><li>Implement the auto installation feature for all the operating systems.</li></ul>                                                                                                                                                                                                                                                                                                                                                                                                           |

