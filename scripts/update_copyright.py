#!/usr/bin/env python

import glob
import os
from pathlib import Path

class Copyright:
    NOTICE = """Licensed to the Software Freedom Conservancy (SFC) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The SFC licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License."""

    def __init__(self, comment_characters='//', prefix=None):
        self._comment_characters = comment_characters
        self._prefix = prefix or []

    def update(self, files):
        for file in files:
            with open(file) as f:
                lines = f.readlines()

            index = -1
            for i, line in enumerate(lines):
                if line.startswith(self._comment_characters) or \
                  self.valid_copyright_notice_line(line, index):
                    index += 1
                else:
                    break

            if index == -1:
                self.write_update_notice(file, lines)
            else:
                current = ''.join(lines[:index + 1])
                if current != self.copyright_notice:
                    self.write_update_notice(file, lines[index + 1:])

    def valid_copyright_notice_line(self, line, index):
        return index + 1 < len(self.copyright_notice_lines) and \
            line.startswith(self.copyright_notice_lines[index + 1])

    @property
    def copyright_notice(self):
        return ''.join(self.copyright_notice_lines)

    @property
    def copyright_notice_lines(self):
        return self._prefix + self.commented_notice_lines

    @property
    def commented_notice_lines(self):
        return [f"{self._comment_characters} {line}".rstrip() + "\n" for line in self.NOTICE.split('\n')]

    def write_update_notice(self, file, lines):
        print(f"Adding notice to {file}")
        with open(file, 'w') as f:
            f.write(self.copyright_notice + "\n")
            f.writelines(lines)

ROOT = Path(os.path.realpath(__file__)).parent.parent

JS_EXCLUSIONS = [
    f"{ROOT}/javascript/atoms/test/jquery.min.js",
    f"{ROOT}/javascript/jsunit/**/*.js",
    f"{ROOT}/javascript/node/selenium-webdriver/node_modules/**/*.js",
    f"{ROOT}/javascript/selenium-core/lib/**/*.js",
    f"{ROOT}/javascript/selenium-core/scripts/ui-element.js",
    f"{ROOT}/javascript/selenium-core/scripts/ui-map-sample.js",
    f"{ROOT}/javascript/selenium-core/scripts/user-extensions.js",
    f"{ROOT}/javascript/selenium-core/scripts/xmlextras.js",
    f"{ROOT}/javascript/selenium-core/xpath/**/*.js",
    f"{ROOT}/javascript/grid-ui/node_modules/**/*.js"
]

PY_EXCLUSIONS = [
    f"{ROOT}/py/selenium/webdriver/common/bidi/cdp.py",
    f"{ROOT}/py/generate.py",
    f"{ROOT}/py/selenium/webdriver/common/devtools/**/*",
    f"{ROOT}/py/venv/**/*"
]


def update_files(file_pattern, exclusions, comment_characters='//', prefix=None):
    included = set(glob.glob(file_pattern, recursive=True))
    excluded = set()
    for pattern in exclusions:
        excluded.update(glob.glob(pattern, recursive=True))
    files = included - excluded

    copyright = Copyright(comment_characters, prefix)
    copyright.update(files)


if __name__ == "__main__":
    update_files(f"{ROOT}/javascript/**/*.js", JS_EXCLUSIONS)
    update_files(f"{ROOT}/javascript/**/*.tsx", [])
    update_files(f"{ROOT}/py/**/*.py", PY_EXCLUSIONS, comment_characters="#")
    update_files(f"{ROOT}/rb/**/*.rb", [], comment_characters="#", prefix=["# frozen_string_literal: true\n", "\n"])
    update_files(f"{ROOT}/java/**/*.java", [])
    update_files(f"{ROOT}/rust/**/*.rs", [])
