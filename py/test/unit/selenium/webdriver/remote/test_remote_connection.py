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


def test_addition_of_auth_headers(mocker):
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
    RemoteConnection._add_request_headers(request, parsed_url)
    assert request.headers['Authorization'] == 'Basic dXNlcjpwYXNz'

