0.4.25
======

* Reuse driver mirror URL (when available) to discover Firefox versions (#13941) (#14493)
* Selenium Manager errors when browser-path is wrong (#13352) (#14381)

0.4.24
======

* Use Firefox history major releases endpoint for version discovery
* Use the Debug format specifier to display error messages (#14388)
* Include arguments for skipping drivers and browsers in path (#14444)

0.4.23
======

* No logical changes in this release.

0.4.22
======

* Include mixed output (INFO, WARN, DEBUG, etc. to stderr and minimal JSON to stdout) (#13414)
* Display driver path in error trace when driver is unavailable
* Include cache paths with non-ascii characters in test (#14066)
* Use pure Rust implementation for which command (#14114)
* Include PATH env for testing SM in CI
* Bump dependencies to latest versions
* Micro optimization in the strings usage and other minor issues
* Use rules_rust 0.42.1 (Rust 1.77.2)

0.4.21
======

* No logical changes in this release.

0.4.20
======

* Minor typo-fix in warning trace
* Use DEBUG level for WARN traces in offline mode (#13810)

0.4.19
======

* Select release with artifact when filtering Edge response (#13735)
* Use apple-flat-package crate to extract PKG files (#13740)
* Fix Edge management in RPM-based Linux (#13705)
* Enhance logic to uncompress DEB files and set toolchain version (#13741)

0.4.18
======

* Add timestamps to Selenium Manager logs (#13554)
* Selenium Manager decrease frequency of statistics reporting (#13555)
* Selenium Manager log level (#13566)

0.4.17
======

* Use latest browser from cache when browser path is not discovered (#13283)
* Throw a descriptive message when error parsing JSON from response (#13291)
* Tracking Selenium Manager usage through Plausible (#11211) (#13173)

0.4.16
======

* Use online mapping to discover proper geckodriver version (#11671) (#13133)
* Refactor logic to discover driver version in Firefox module using match
* Refactor logic to discover driver version and download browser if necessary
* Replace function for creating parent path if not exists
* Fix condition to download browser in discover local browser logic
* Use drivers found in PATH only when browser version is not specified (#13159)
* Panic if JSON output is used but no entries are collected (#13101)
* Fix webview2 support when browser path is set (#13204)

0.4.15
======

* Include mirror arguments to change default online repository URLs (#11687)
* Support for automatic management of Firefox ESR (#12946)
* Fix webview2 support (#12966)
* Include checkbox in SM workflow to generate binaries with debug symbols (#12974)
* Include flag in workflow to build SM in CI with debug info
* Include debug and split-debuginfo in dev profile
* Change windows target to stable-i686-pc-windows-gnu
* Bump all crates to the last versions (#13028)
* Fix conditions to check edge in cache (#13057)

0.4.14
======

* Use original browser version in Firefox management logic
* Clean logic for checking driver version
* Avoids resolving symbolic links and consider the cache might not be writable (#12877)
* Include webview2 in Edge module (#12904)
* Capture Rust backtrace in case of error (displayed at DEBUG level) (#12852)
* Automated Edge management (#11681 and #11683) (#12835)
* Add support for Chromium (#12511) (#12890)

0.4.13
======

* Ensure logger is set first so other setters can use it (#12720)
* Avoid using robocopy to move extracted files from sfx in windows (#12690)
* Make sure offline sets associated flags (#12718)
* Do not log a warning for defaults (#12754)
* Search better driver possible in the cache (#12753)
* Use original path when unwrap fails in canonicalize function (#12699)
* Fix config setup in Selenium Manager (#12807)

0.4.12
======

* Build universal macOS Selenium-Manager on CI (#12455)
* Fix bug in condition to check stable label (#12472)
* Implement browser path discovery for iexplorer (#12489)
* Fix bug storing metadata for iexplorer (#12488)
* Change default type for binaries downloaded by Selenium (#11685, #12485)
* Allow changing default folder for Selenium Manager cache (#11688, #12514)
* Fix bug with storing browser path when found in PATH
* Set permissions before copying extracted files
* Force executable permissions on extracted drivers
* Unify browser_ttl and driver_ttl (#12526)
* Rename configuration file to se-config.toml (#12550)
* Rename metadata file to se-metadata.json (#12531)
* Automated Firefox management (#11680 and #11682)
* Bump dependencies to the latest versions (#12601)
