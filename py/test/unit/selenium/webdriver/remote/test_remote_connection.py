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

import pytest

from selenium.webdriver.remote.remote_connection import RemoteConnection


def test_basic_auth(mocker):
    def check(request, timeout):
        assert request.headers['Authorization'] == 'Basic dXNlcjpwYXNz'

    try:
        method = mocker.patch('urllib.request.OpenerDirector.open')
    except ImportError:
        method = mocker.patch('urllib2.OpenerDirector.open')
    method.side_effect = check

    with pytest.raises(AttributeError):
        RemoteConnection('http://user:pass@remote', resolve_ip=False) \
            .execute('status', {})
