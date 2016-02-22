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
from selenium.webdriver.common import service


class Service(service.Service):
    """
    Object that manages the starting and stopping of PhantomJS / Ghostdriver
    """

    def __init__(self, executable_path, port=0, service_args=None, log_path=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to PhantomJS binary
         - port : Port the service is running on
         - service_args : A List of other command line options to pass to PhantomJS
         - log_path: Path for PhantomJS service to log to
        """
        self.service_args= service_args
        if self.service_args is None:
            self.service_args = []
        else:
            self.service_args=service_args[:]
        if not log_path:
            log_path = "ghostdriver.log"

        service.Service.__init__(self, executable_path, port=port, log_file=open(log_path, 'w'))


    def command_line_args(self):
        return self.service_args + ["--webdriver=%d" % self.port]

    @property
    def service_url(self):
        """
        Gets the url of the GhostDriver Service
        """
        return "http://localhost:%d/wd/hub" % self.port

    def send_remote_shutdown_command(self):
        pass
