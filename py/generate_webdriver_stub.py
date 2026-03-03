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


"""Generates selenium/webdriver/__init__.pyi from the lazy import mapping in __init__.py."""

import json
from pathlib import Path

OUTPUT_FILE = Path("selenium") / "webdriver" / "__init__.pyi"


# Map lazy imports exactly like in selenium/webdriver/__init__.py
LAZY_IMPORTS = {
    # Chrome
    "Chrome": "WebDriver",
    "ChromeOptions": "Options",
    "ChromeService": "Service",
    # Edge
    "Edge": "WebDriver",
    "ChromiumEdge": "WebDriver",
    "EdgeOptions": "Options",
    "EdgeService": "Service",
    # Firefox
    "Firefox": "WebDriver",
    "FirefoxOptions": "Options",
    "FirefoxProfile": "FirefoxProfile",
    "FirefoxService": "Service",
    # IE
    "Ie": "WebDriver",
    "IeOptions": "Options",
    "IeService": "Service",
    # Safari
    "Safari": "WebDriver",
    "SafariOptions": "Options",
    "SafariService": "Service",
    # Remote
    "Remote": "WebDriver",
    # WebKitGTK
    "WebKitGTK": "WebDriver",
    "WebKitGTKOptions": "Options",
    "WebKitGTKService": "Service",
    # WPEWebKit
    "WPEWebKit": "WebDriver",
    "WPEWebKitOptions": "Options",
    "WPEWebKitService": "Service",
    # Common utilities
    "ActionChains": "ActionChains",
    "DesiredCapabilities": "DesiredCapabilities",
    "Keys": "Keys",
    "Proxy": "Proxy",
}


def generate_stub():
    lines = [
        "# Auto-generated stub for selenium.webdriver",
        "# ruff: noqa: F401, F821, I001, UP037, RUF100",
        "",
        "# Expose runtime version",
        "__version__: str",
        "",
        "# Lazy imports (forward references)",
    ]

    for name, typ in sorted(LAZY_IMPORTS.items()):
        lines.append(f"{name}: {json.dumps(typ)}")  # always double quotes

    content = "\n".join(lines) + "\n"

    OUTPUT_FILE.write_text(content, encoding="utf-8")

    print(f"Generated: {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_stub()
