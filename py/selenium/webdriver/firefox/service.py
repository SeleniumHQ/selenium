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
from subprocess import PIPE
from selenium.webdriver.common import service

class Service(service.Service):
    """
    Object that manages the starting and stopping of the GeckoDriver
    """

    def __init__(self, executable_path, firefox_binary=None, port=0, service_args=None,
                 log_path=None, env=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the GeckoDriver
         - port : Port the service is running on
         - service_args : List of args to pass to the Geckodriver service
         - log_path : Path for the GeckoDriver service to log to"""

        if log_path:
            log_file = open(log_path, "w")
        else:
            log_file = PIPE
        service.Service.__init__(self, executable_path, port=port, log_file=log_file, env=env)
        self.firefox_binary = firefox_binary
        self.service_args = service_args or []

    def command_line_args(self):
        if self.firefox_binary:
            return ["-b", self.firefox_binary, '--webdriver-port', "%d" % self.port]
        return ['--webdriver-port', "%d" % self.port]

    def send_remote_shutdown_command(self):
        pass
