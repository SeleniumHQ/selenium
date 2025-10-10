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

import gc
import logging
import platform
from typing import Optional

from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chromium.webdriver import ChromiumDriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

logger = logging.getLogger(__name__)


class WebDriver(ChromiumDriver):
    """Controls the ChromeDriver and allows you to drive the browser.
    
    WARNING: When using 32-bit Chrome on Windows, each tab has a memory limit
    of approximately 1GB. Large extensions or web applications may exceed this
    limit causing out-of-memory errors. Consider using 64-bit Chrome or
    manually managing tab lifecycles and triggering garbage collection.
    """

    def __init__(
        self,
        options: Optional[Options] = None,
        service: Optional[Service] = None,
        keep_alive: bool = True,
    ) -> None:
        """Creates a new instance of the chrome driver. Starts the service and
        then creates new instance of chrome driver.

        :Args:
         - options - this takes an instance of ChromeOptions
         - service - Service object for handling the browser driver if you need to pass extra details
         - keep_alive - Whether to configure ChromeRemoteConnection to use HTTP keep-alive.
        """
        service = service if service else Service()
        options = options if options else Options()
        super().__init__(
            browser_name=DesiredCapabilities.CHROME["browserName"],
            vendor_prefix="goog",
            options=options,
            service=service,
            keep_alive=keep_alive,
        )
        
        # Log warning for 32-bit Chrome on Windows
        if platform.system() == "Windows" and platform.architecture()[0] == "32bit":
            logger.warning(
                "Running 32-bit Chrome on Windows. Each tab has a 1GB memory limit. "
                "Out-of-memory errors may occur with large extensions or applications. "
                "Consider upgrading to 64-bit Chrome."
            )

    def quit(self) -> None:
        """Closes the browser and shuts down the ChromeDriver executable
        that is started when starting the ChromeDriver. Includes improved
        cleanup for memory management.
        """
        try:
            # Close all window handles before quit
            if hasattr(self, 'window_handles'):
                try:
                    handles = self.window_handles
                    for handle in handles[:-1]:  # Keep last handle for quit
                        try:
                            self.switch_to.window(handle)
                            self.close()
                        except Exception:
                            pass
                except Exception:
                    pass
        except Exception:
            pass
        
        # Call parent quit
        super().quit()
        
        # Force garbage collection to free memory
        gc.collect()

    def close(self) -> None:
        """Closes the current window. Triggers garbage collection
        to help manage memory with 32-bit Chrome limitations.
        """
        super().close()
        
        # Force garbage collection after closing window
        gc.collect()

    def switch_to_new_window(self, type_hint: str = "tab") -> None:
        """Switches to a new window of a given type.
        
        Before creating new windows on 32-bit systems, triggers garbage
        collection to maximize available memory.
        
        :Args:
         - type_hint - the type of new window, either 'tab' or 'window'
        """
        # Force GC before opening new window to free memory
        if platform.system() == "Windows" and platform.architecture()[0] == "32bit":
            gc.collect()
        
        super().switch_to_new_window(type_hint)
