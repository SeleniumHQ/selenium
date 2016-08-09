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
from selenium.webdriver.common import service, utils
from subprocess import PIPE


class Service(service.Service):
    """
    Object that manages the starting and stopping of the SafariDriver
    """

    def __init__(self, executable_path=None, port=0, quiet=False, use_legacy=False):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the SafariDriver
         - port : Port the service is running on """

        if not use_legacy and os.path.exists('/usr/bin/safaridriver'):
            path = '/usr/bin/safaridriver'
            self.legacy_driver = False
        else:
            path = 'java'
            self.standalone_jar = executable_path
            self.legacy_driver = True

        if port == 0:
            port = utils.free_port()

        self.quiet = quiet
        log = PIPE
        if quiet:
            log = open(os.devnull, 'w')
        service.Service.__init__(self, path, port, log)

    def command_line_args(self):
        if self.legacy_driver:
            return ["-jar", self.standalone_jar, "-port", "%s" % self.port]
        return ["-p", "%s" % self.port]

    @property
    def service_url(self):
        """
        Gets the url of the SafariDriver Service
        """
        if not self.legacy_driver:
            return "http://localhost:%d" % self.port
        else:
            return "http://localhost:%d/wd/hub" % self.port
