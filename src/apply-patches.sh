#!/bin/sh
#
# Applies patches to Selenium.
#
# You should run this script once after importing Selenium with Ant.
#

cat selenium-patches/clear-javascript-warnings.patch | (cd content/selenium && patch -p0)
