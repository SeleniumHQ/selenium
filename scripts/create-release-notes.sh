#!/usr/bin/env bash

RELEASE_TAG=$1
PREVIOUS_TAG=$2
DEST_DIRECTORY=$3


echo "" > ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "### Changelog" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "For each component's detailed changelog, please check:" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [Ruby](https://github.com/SeleniumHQ/selenium/blob/trunk/rb/CHANGES)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [Python](https://github.com/SeleniumHQ/selenium/blob/trunk/py/CHANGES)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [JavaScript](https://github.com/SeleniumHQ/selenium/blob/trunk/javascript/node/selenium-webdriver/CHANGES.md)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [Java](https://github.com/SeleniumHQ/selenium/blob/trunk/java/CHANGELOG)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [DotNet](https://github.com/SeleniumHQ/selenium/blob/trunk/dotnet/CHANGELOG)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "* [IEDriverServer](https://github.com/SeleniumHQ/selenium/blob/trunk/cpp/iedriverserver/CHANGELOG)" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "### Commits in this release" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "<details>" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "<summary>Click to see all the commits included in this release</summary>" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
git --no-pager log "${PREVIOUS_TAG}...${RELEASE_TAG}" --pretty=format:"* [\`%h\`](http://github.com/seleniumhq/selenium/commit/%H) - %s :: %an" --reverse >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md
echo "</details>" >> ${DEST_DIRECTORY}/release_notes_${RELEASE_TAG}.md

