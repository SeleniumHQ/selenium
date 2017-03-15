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

from selenium.webdriver.remote.remote_connection import (
    RemoteConnection,
    Request
)


def test_add_remote_connection_headers_adds_auth_header():
    url = 'http://user:pass@remote'
    parsed_url = parse.urlparse(url)
    cleaned_url = parse.urlunparse((
        parsed_url.scheme,
        parsed_url.hostname,
        parsed_url.path,
        parsed_url.params,
        parsed_url.query,
        parsed_url.fragment)
    )
    request = Request(cleaned_url)
    request.add_remote_connection_headers(parsed_url)
    assert request.headers['Authorization'] == 'Basic dXNlcjpwYXNz'


class MockResponse:
    code = 200
    headers = []
    def read(self):
        return b"{}"
    def close(self):
        pass
    def getheader(self, *args, **kwargs):
        pass


def test_remote_connection_calls_add_remote_connection_headers(mocker):
    # Stub out response
    try:
        mock_open = mocker.patch('urllib.request.OpenerDirector.open')
    except ImportError:
        mock_open = mocker.patch('urllib2.OpenerDirector.open')
    mock_open.return_value = MockResponse()

    # Add mock to test that RemoteConnection._request calls
    # add_remote_connection_headers method.
    mock = mocker.patch(
        'selenium.webdriver.remote.remote_connection.Request.add_remote_connection_headers'
    )
    url = 'http://user:pass@remote'
    command = 'status'
    RemoteConnection(url, resolve_ip=False).execute(command, {})
    expected_url = parse.urlparse("%s/%s" % (url, command))
    mock.assert_called_once_with(expected_url)
