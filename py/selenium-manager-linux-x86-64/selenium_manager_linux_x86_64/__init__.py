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

"""Selenium Manager binary for Linux x86-64. Launched by the `selenium-manager` package."""

import importlib.resources

__all__ = ["binary_path"]


def binary_path() -> str:
    """Return the absolute path of the bundled binary.

    Wheels are installed unzipped, so the packaged resource is always a real file
    on disk and the caller can exec it without staging a copy first.
    """
    return str(importlib.resources.files(__package__) / "bin" / "selenium-manager")
