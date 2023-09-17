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

* build universal macOS Selenium-Manager on CI (#12455)
* fix bug in condition to check stable label (#12472)
* implement browser path discovery for iexplorer (#12489)
* fix bug storing metadata for iexplorer (#12488)
* change default type for binaries downloaded by Selenium (#11685, #12485)
* allow changing default folder for Selenium Manager cache (#11688, #12514)
* fix bug with storing browser path when found in PATH
* set permissions before copying extracted files
* force executable permissions on extracted drivers
* unify browser_ttl and driver_ttl (#12526)
* rename configuration file to se-config.toml (#12550)
* rename metadata file to se-metadata.json (#12531)
* automated Firefox management (#11680 and #11682)
* bump dependencies to the latest versions (#12601)
