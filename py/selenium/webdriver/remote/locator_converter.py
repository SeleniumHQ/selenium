# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

import re

from selenium.common.exceptions import InvalidSelectorException
from selenium.webdriver.common.by import By

# ASCII whitespace only. Python's \s also matches Unicode whitespace.
_CSS_WHITESPACE = " \t\n\v\f\r"
_SPECIAL_CHARS = re.compile("([ \\t\\n\\x0b\\f\\r'\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-/\\[\\]()])")


def _escape_css(value):
    """Escape a value for a CSS identifier. The result is safe inside [name='...']."""
    escaped = _SPECIAL_CHARS.sub(r"\\\1", value)
    # CSS drops a backslash followed by a newline, so newlines need hex escapes instead.
    escaped = escaped.replace("\\\n", "\\a ").replace("\\\r", "\\d ").replace("\\\f", "\\c ")
    # CSS only requires the leading-digit escape for ASCII 0-9; non-ASCII Unicode digits
    # (e.g. Arabic-Indic, fullwidth) are already valid identifier-start code points and must
    # be left untouched, or they collide with the escape for a different ASCII digit.
    if escaped and "0" <= escaped[0] <= "9":
        escaped = f"\\{30 + int(escaped[0])} {escaped[1:]}"
    return escaped


class LocatorConverter:
    def convert(self, by, value):
        # Default conversion logic
        if by == By.ID:
            # "#" is not a valid selector.
            if value == "":
                return By.CSS_SELECTOR, '[id=""]'
            return By.CSS_SELECTOR, f"#{_escape_css(value)}"
        elif by == By.CLASS_NAME:
            if value and any(char in _CSS_WHITESPACE for char in value):
                raise InvalidSelectorException("Compound class names are not allowed.")
            return By.CSS_SELECTOR, f".{_escape_css(value)}"
        elif by == By.NAME:
            return By.CSS_SELECTOR, f"*[name='{_escape_css(value)}']"
        return by, value
