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

import pytest


def test_launch(driver):
    assert driver.capabilities['browserName'] == 'Safari'


def test_launch_with_invalid_executable_path_raises_exception(driver_class):
    path = '/this/path/should/never/exist'
    assert not os.path.exists(path)
    with pytest.raises(Exception) as e:
        driver_class(executable_path=path)
    assert 'are you running Safari 10 or later?' in str(e)


@pytest.mark.skipif(not os.path.exists('/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver'), reason="Preview not installed")
class TestTechnologyPreview(object):

    @pytest.fixture
    def driver_kwargs(self):
        path = '/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver'
        assert os.path.exists(path), 'Safari Technology Preview required! Download it from https://developer.apple.com/safari/technology-preview/'
        return {'executable_path': path}

    def test_launch(self, driver):
        assert driver.capabilities['browserName'] == 'safari'


def test_launch_safari_with_legacy_flag(mocker, driver_class):
    import subprocess
    mocker.patch('subprocess.Popen')
    try:
        driver_class(service_args=['--legacy'])
    except Exception:
        pass
    args, kwargs = subprocess.Popen.call_args
    assert '--legacy' in args[0]


def test_launch_safari_without_legacy_flag(mocker, driver_class):
    import subprocess
    mocker.patch('subprocess.Popen')
    try:
        driver_class()
    except Exception:
        pass
    args, kwargs = subprocess.Popen.call_args
    assert '--legacy' not in args[0]
