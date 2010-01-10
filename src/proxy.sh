#!/bin/bash

# This script will create a 'local' copy of the se-ide extension which you can
# then point to using the proxy trick described at http://wiki.openqa.org/display/SIDE/Building+Selenium+IDE
# But, before you run it, you need to do a 'mvn clean install' to get the
# external dependencies moved into the right spots

TMP_DIR="build"

# remove any left-over files from previous build
rm -rf $TMP_DIR

mkdir -p $TMP_DIR/content

cp -R content $TMP_DIR
rm -rf $TMP_DIR/content/selenium-tests
rm -rf $TMP_DIR/content/tests
cp -R locale $TMP_DIR
cp -R skin $TMP_DIR
cp -R components $TMP_DIR
cp -R content-files $TMP_DIR
cp install.rdf $TMP_DIR
cp chrome.manifest $TMP_DIR
find $TMP_DIR -name ".svn" -type d -exec rm -rf {} \; 