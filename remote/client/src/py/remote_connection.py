# Copyright 2008-2009 WebDriver committers
# Copyright 2008-2009 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import httplib
import logging
import utils
from ..common.exceptions import ErrorInResponseException
from ..common.exceptions import NoSuchElementException
from ..common.exceptions import RemoteDriverServerException


class RemoteConnection(object):

    def __init__(self, remote_server_addr, browser_name, platform):
        self._conn = httplib.HTTPConnection(remote_server_addr)
        self._context = "foo"
        self._session_id = ""
        resp = self.post(
            "/hub/session",
            {"browserName": browser_name,
             "platform": platform,
             "class":"org.openqa.selenium.remote.DesiredCapabilities",
             "javascriptEnabled":False,
             "version":""},
            )
        #TODO: handle the capabilities info sent back from server
        self._session_id = resp["sessionId"]

    def post(self, path, *params):
        return self.request("POST", path, *params)

    def get(self, path, *params):
        return self.request("GET", path, *params)

    def delete(self, path):
        return self.request("DELETE", path)

    def request(self, method, path, *params):
        if params:
            payload = utils.format_json(params)
            logging.debug("request:" + path + payload)
        else:
            payload = ""

        if not path.startswith("/hub") and not path.startswith("http://"):
            path =  ("/hub/session/%s/%s/" %
                     (self._session_id, self._context) + path)
        self._conn.request(method, path,
                           body = payload, 
                           headers={"Accept":"application/json"})
        return self._process_response()

    def quit(self):
        self.delete("/hub/session/%s" % self._session_id)

    def _process_response(self):
        resp = self._conn.getresponse()
        data = resp.read()
        if (resp.status in [301, 302, 303, 307] and
            resp.getheader("location") != None):
            redirected_url = resp.getheader("location")
            return self.get(redirected_url)
        if resp.status == 200 and data:
            decoded_data = utils.load_json(data)
            logging.debug("response:" + utils.format_json(decoded_data))
            if decoded_data["error"]:
                raise ErrorInResponseException(
                    decoded_data,
                    ("Error occurred when remote driver (server) is processing"
                     "the request:") +  utils.format_json(decoded_data))
            return decoded_data
        elif resp.status in [202, 204]:
            pass
        elif resp.status == 404:
            raise NoSuchElementException()
        else:
            raise RemoteDriverServerException(
                "Server error in the remote driver server, status=%d"
                % resp.status)
