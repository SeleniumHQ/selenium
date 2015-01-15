#!/usr/bin/python
#
# Copyright 2011 Webdriver_name committers
# Copyright 2011 Google Inc.
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
from __future__ import absolute_import

import os
import six
import subprocess
from subprocess import PIPE

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.baseservice import BaseService


class Service(BaseService):
    """
    Object that manages the starting and stopping of the ChromeDriver
    """

    def __init__(self, executable_path, port=0, service_args=None,
                 log_path=None, env=None):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the ChromeDriver
         - port : Port the service is running on
         - service_args : List of args to pass to the chromedriver service
         - log_path : Path for the chromedriver service to log to
        """
        super(Service, self).__init__(executable_path, port=port)
        self.service_args = service_args or []
        if log_path:
            self.service_args.append('--log-path=%s' % log_path)
        self.env = env or os.environ

    @property
    def _start_args(self):
        return [self.path, "--port=%d" % self.port] + self.service_args

    @property
    def _start_kwargs(self):
        return dict(env=self.env, stdout=PIPE, stderr=PIPE)

    def stop(self):
        """
        Tells the ChromeDriver to stop and cleans up the process
        """
        #If its dead dont worry
        if self.process is None:
            return

        #Tell the Server to die!
        six.moves.urllib.request.urlopen("http://127.0.0.1:%d/shutdown" % self.port)
        self.wait_for_close_or_force()
