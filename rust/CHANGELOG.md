0.4.13
======
* Ensure logger is set first so other setters can use it (#12720)
* Avoid using robocopy to move extracted files from sfx in windows (#12690)
* Make sure offline sets associated flags (#12718)
* Do not log a warning for defaults (#12754)
* Search better driver possible in the cache (#12753)
* Use original path when unwrap fails in canonicalize function (#12699)

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
