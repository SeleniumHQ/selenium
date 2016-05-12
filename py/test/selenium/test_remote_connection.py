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

from selenium.webdriver.remote import remote_connection
from selenium.webdriver.remote.command import Command
import unittest
from mock import Mock, MagicMock


try:
    import http.client as httplib
    from urllib import request as url_request
except ImportError: # above is available in py3+, below is py2.7
    import httplib as httplib
    import urllib2 as url_request


REMOTE_URL = "http://grid.seleniumhq.org/wd/hub"
REMOTE_HOST = "grid.seleniumhq.org"

class TestRemoteConnection(unittest.TestCase):
    def setUp(self):
        self.mock_add_header = MagicMock(return_value=None)
        self.mock_request = MagicMock(return_value=None)

        remote_connection.Request = MagicMock(return_value=Mock(add_header=self.mock_add_header))
        response_mock = Mock(code=200, read=MagicMock(return_value='{"status":0, "state":"success"}'), getheader=MagicMock(return_value="application/json"))
        url_request.build_opener = MagicMock(return_value=Mock(open=MagicMock(return_value=response_mock)))
        httplib.HTTPConnection = MagicMock(return_value=Mock(request=self.mock_request,getresponse=Mock(return_value=response_mock)))

    def test_host_header_without_keep_alive(self):
        self.rc = remote_connection.RemoteConnection(REMOTE_URL)
        self.rc.execute(Command.STATUS, {})
        self.mock_add_header.assert_called_with('Host', REMOTE_HOST)

    def test_host_header_with_keep_alive(self):
        self.rc = remote_connection.RemoteConnection(REMOTE_URL, keep_alive=True)
        self.rc.execute(Command.STATUS, {})
        self.mock_request.assert_called_with('GET', '/wd/hub/status', None, {
            'GET': '/wd/hub/status', 
            'Host': 'grid.seleniumhq.org', 
            'Accept': 'application/json', 
            'User-Agent': 'Python http auth', 
            'Connection': 'keep-alive', 
            'Content-type': 'application/json;charset="UTF-8"'
        })

    def tearDown(self):
        pass

if __name__ == "__main__":
    unittest.main()
