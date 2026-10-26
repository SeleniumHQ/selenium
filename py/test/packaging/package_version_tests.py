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

import os
import tarfile
import zipfile
from email.parser import Parser


def _metadata_version(text):
    return Parser().parsestr(text)["Version"]


def test_wheel_ships_one_version_module_matching_its_metadata():
    with zipfile.ZipFile(os.environ["SELENIUM_WHEEL"]) as wheel:
        names = wheel.namelist()
        metadata = next(name for name in names if name.endswith(".dist-info/METADATA"))
        version = _metadata_version(wheel.read(metadata).decode())

        assert names.count("selenium/_version.py") == 1
        assert wheel.read("selenium/_version.py").decode().endswith(f'__version__ = "{version}"\n')


def test_sdist_ships_one_version_module_matching_its_metadata():
    with tarfile.open(os.environ["SELENIUM_SDIST"]) as sdist:
        names = sdist.getnames()
        root = names[0].split("/")[0]
        version = _metadata_version(sdist.extractfile(f"{root}/PKG-INFO").read().decode())

        module = f"{root}/selenium/_version.py"
        assert names.count(module) == 1
        assert sdist.extractfile(module).read().decode().endswith(f'__version__ = "{version}"\n')
