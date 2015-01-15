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

from os import devnull
import subprocess
import time
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.baseservice import BaseService


class Service(BaseService):
    """
    Object that manages the starting and stopping of the SafariDriver
    """

    def __init__(self, executable_path, port=0, quiet=False):
        """
        Creates a new instance of the Service

        :Args:
         - executable_path : Path to the SafariDriver
         - port : Port the service is running on
        """
        super(Service, self).__init__(executable_path, port=port)
        self.quiet = quiet

    @property
    def _start_args(self):
        return ["java", "-jar", self.path, "-port", "%s" % self.port]

    @property
    def _start_kwargs(self):
        if not self.quiet:
            return {}
        devnull_out = open(devnull, 'w')
        return dict(stdout=devnull_out, stderr=devnull_out)

    @property
    def service_url(self):
        """
        Gets the url of the SafariDriver Service
        """
        return '{0}/wd/hub'.format(super(Service, self).service_url)
