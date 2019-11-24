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


try:
    from urllib import parse
except ImportError:  # above is available in py3+, below is py2.7
    import urlparse as parse

from selenium import __version__
from selenium.webdriver.remote.remote_connection import (
    RemoteConnection,
)


def test_get_remote_connection_headers_defaults():
    url = 'http://remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert 'Authorization' not in headers.keys()
    assert 'Connection' not in headers.keys()
    assert headers.get('Accept') == 'application/json'
    assert headers.get('Content-Type') == 'application/json;charset=UTF-8'
    assert headers.get('User-Agent').startswith("selenium/%s (python " % __version__)
    assert headers.get('User-Agent').split(' ')[-1] in {'windows)', 'mac)', 'linux)'}


def test_get_remote_connection_headers_adds_auth_header_if_pass():
    url = 'http://user:pass@remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url))
    assert headers.get('Authorization') == 'Basic dXNlcjpwYXNz'


def test_get_remote_connection_headers_adds_keep_alive_if_requested():
    url = 'http://remote'
    headers = RemoteConnection.get_remote_connection_headers(parse.urlparse(url), keep_alive=True)
    assert headers.get('Connection') == 'keep-alive'


class MockResponse:
    code = 200
    headers = []

    def read(self):
        return b"{}"

    def close(self):
        pass

    def getheader(self, *args, **kwargs):
        pass
