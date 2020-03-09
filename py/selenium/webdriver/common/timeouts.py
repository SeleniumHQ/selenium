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

class Timeouts(object):
    
    def __init__(self, implicit_wait=None, page_load=None, script=None):
        """
        Create a new Timeout object.

        :Args:
         - implicit_wait - Either an int or a float. The number passed in needs to how many 
            seconds the driver will wait.
         - page_load - Either an int or a float. The number passed in needs to how many 
            seconds the driver will wait.
         - script - Either an int or a float. The number passed in needs to how many 
            seconds the driver will wait.
        """
        self._implicit_wait = self._convert(implicit_wait)
        self._page_load = self._convert(page_load)
        self._script = self._convert(script)

    @property
    def implicit_wait(self):
        """
        Return the value for the implicit wait. This does not return the value on the remote end
        """
        return self._implicit_wait / 1000

    @implicit_wait.setter
    def implicit_wait(self, _implicit_wait):
        """
        Sets the value for the implicit wait. This does not set the value on the remote end
        """
        self._implicit_wait = self._convert(_implicit_wait)

    @property
    def page_load(self):
        """
        Return the value for the page load wait. This does not return the value on the remote end
        """
        return self._page_load / 1000

    @page_load.setter
    def page_load(self, _page_load):
        """
        Sets the value for the page load wait. This does not set the value on the remote end
        """
        self._page_load = self._convert(_page_load)

    @property
    def script(self):
        """
        Return the value for the script wait. This does not return the value on the remote end
        """
        return self._script / 1000

    @script.setter
    def script(self, _script):
        """
        Sets the value for the script wait. This does not set the value on the remote end
        """
        self._script = self._convert(_script)

    def _convert(self, timeout):
        if timeout is not None:
            if isinstance(timeout, (int, float)):
                return int(float(timeout) * 1000)
            else:
                raise TypeError("Timeouts can only be an int or a float")

    def _to_json(self):
        timeouts = {}
        if self._implicit_wait is not None:
            timeouts["implicit"] = self._implicit_wait
        if self._page_load is not None:
            timeouts["pageLoad"] = self._page_load
        if self._script is not None:
            timeouts["script"] = self._script
        
        return timeouts
