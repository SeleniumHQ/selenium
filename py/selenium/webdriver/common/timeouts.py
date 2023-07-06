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


from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import sys

    if sys.version_info >= (3, 8):
        from typing import TypedDict
    else:
        from typing_extensions import TypedDict

    class JSONTimeouts(TypedDict, total=False):
        implicit: int
        pageLoad: int
        script: int

else:
    from typing import Dict

    JSONTimeouts = Dict[str, int]


class _TimeoutsDescriptor:
    """TimeoutsDescriptor which gets and sets value of below attributes:

    _implicit _timeout
    _page_load
    _script

    This does not set the value on the remote end
    """

    def __init__(self, name):
        self.name = name

    def __get__(self, obj, cls) -> float:
        return getattr(obj, self.name) / 1000

    def __set__(self, obj, value) -> None:
        converted_value = getattr(obj, "_convert")(value)
        setattr(obj, self.name, converted_value)


class Timeouts:
    def __init__(self, implicit_wait: float = 0, page_load: float = 0, script: float = 0) -> None:
        """Create a new Timeout object.

        :Args:
         - implicit_wait - Either an int or a float. The number passed in needs to how many
            seconds the driver will wait.
         - page_load - Either an int or a float. The number passed in needs to how many
            seconds the driver will wait.
         - script - Either an int or a float. The number passed in needs to how many
            seconds the driver will wait.
        """
        self.implicit_wait = implicit_wait
        self.page_load = page_load
        self.script = script

    # Creating descriptor objects
    implicit_wait = _TimeoutsDescriptor("_implicit_wait")
    """Sets and Gets the value of the implicit_timeout:

    This does not set the value on the remote end.

    Usage
    -----
    - Get
        - `self.implicit_timeout`
    - Set
        - `self.implicit_timeout` = `value`

    Parameters
    ----------
    `value`: `float`
    """

    page_load = _TimeoutsDescriptor("_page_load")
    """Sets and Gets the value of page load wait:

    This does not set the value on the remote end.

    Usage
    -----
    - Get
        - `self.page_load`
    - Set
        - `self.page_load` = `value`

    Parameters
    ----------
    `value`: `float`
    """

    script = _TimeoutsDescriptor("_script")
    """Sets and Gets the value of script wait:

    This does not set the value on the remote end.

    Usage
    ------
    - Get
        - `self.script`
    - Set
        - `self.script` = `value`

    Parameters
    -----------
    `value`: `float`
    """

    def _convert(self, timeout: float) -> int:
        if isinstance(timeout, (int, float)):
            return int(float(timeout) * 1000)
        raise TypeError("Timeouts can only be an int or a float")

    def _to_json(self) -> JSONTimeouts:
        timeouts: JSONTimeouts = {}
        if self._implicit_wait:
            timeouts["implicit"] = self._implicit_wait
        if self._page_load:
            timeouts["pageLoad"] = self._page_load
        if self._script:
            timeouts["script"] = self._script

        return timeouts
