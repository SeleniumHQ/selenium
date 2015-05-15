#!/usr/bin/python
#
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
import platform
import time
import subprocess

from selenium.webdriver.remote.command import Command
from selenium.webdriver.remote.webdriver import WebDriver as RemoteWebDriver
from selenium.common.exceptions import WebDriverException

class WebDriver(RemoteWebDriver):
    """
    Controls the BlackBerry Browser and allows you to drive it.

    """
    def __init__(self, device_pass, bb_tools_dir, hostip=None, port=1338,desired_capabilities={}):
        """
        Creates a new instance of the BlackBerry driver.

        """
        if(hostip == None):
            hostip = '169.254.0.1'

        remoteAddr = 'http://' + str(hostip) + ':' + str(port)

        """
        Find blackberry-deploy, this is need to launch the browser remotely.

        This is installed by getting the BlackBerry 10 NDK
        """
        if(os.path.isdir(bb_tools_dir)):
            filename = 'blackberry-deploy'
            if(platform.system() == "Windows"):
                filename += '.bat'

            bb_deploy_location = os.path.join(bb_tools_dir, filename)
        else:
            raise WebDriverException('invalid blackberry-deploy location')
        """
        Now launch the BlackBerry browser before allowing anything else to run.
        """
        try:
            launchArgs = [bb_deploy_location, '-launchApp', str(hostip), '-package-name', 'sys.browser', '-package-id', 'gYABgJYFHAzbeFMPCCpYWBtHAm0', '-password', str(device_pass)]
            with open(os.devnull, 'w') as fp: #this allows the suppression of the blackberry-deploy command output, it's a bit chatty
                p = subprocess.Popen(launchArgs, stdout=fp)

            returncode = p.wait()

            if(returncode == 0):
                time.sleep(3) # give the browser time to initialize
                RemoteWebDriver.__init__(self,
                    command_executor=remoteAddr,
                    desired_capabilities=desired_capabilities)
            else:
                raise WebDriverException('bb-deploy failed to launch browser')
        except:
            raise WebDriverException('something went wrong launching blackbery-deploy')

    def quit(self):
        """
        Closes the browser and shuts down the
        """
        try:
            RemoteWebDriver.quit(self)
        except http_client.BadStatusLine:
            pass