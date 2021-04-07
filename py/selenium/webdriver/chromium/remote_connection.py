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

from selenium.webdriver.remote.remote_connection import RemoteConnection


class ChromiumRemoteConnection(RemoteConnection):
    def __init__(self, remote_server_addr, vendor_prefix, browser_name, keep_alive=True, ignore_proxy=False):
        RemoteConnection.__init__(self, remote_server_addr, keep_alive, ignore_proxy=ignore_proxy)
        self.browser_name = browser_name
        self._commands["launchApp"] = ('POST', '/session/$sessionId/chromium/launch_app')
        self._commands["setNetworkConditions"] = ('POST', '/session/$sessionId/chromium/network_conditions')
        self._commands["getNetworkConditions"] = ('GET', '/session/$sessionId/chromium/network_conditions')
        self._commands['executeCdpCommand'] = ('POST', '/session/$sessionId/{}/cdp/execute'.format(vendor_prefix))
        self._commands['getSinks'] = ('GET', '/session/$sessionId/{}/cast/get_sinks'.format(vendor_prefix))
        self._commands['getIssueMessage'] = ('GET', '/session/$sessionId/{}/cast/get_issue_message'.format(vendor_prefix))
        self._commands['setSinkToUse'] = ('POST', '/session/$sessionId/{}/cast/set_sink_to_use'.format(vendor_prefix))
        self._commands['startTabMirroring'] = ('POST', '/session/$sessionId/{}/cast/start_tab_mirroring'.format(vendor_prefix))
        self._commands['stopCasting'] = ('POST', '/session/$sessionId/{}/cast/stop_casting'.format(vendor_prefix))
