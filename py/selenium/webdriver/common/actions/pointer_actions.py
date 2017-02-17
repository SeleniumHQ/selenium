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
from interaction import Interaction
from .pointer_input import PointerInput


class PointerActions(Interaction):

    def __init__(self, source=None):
        if source is None:
            source = PointerInput("mouse", "mouse")
        self.source = source
        super(PointerActions, self).__init__(source)

    def pointer_down(self, button, device=None):
        self._button_action("create_pointer_down", button=button)

    def pointer_up(self):
        self._button_action("create_pointer_up")

    def pause(self, duration=0):
        self.source.create_pause(duration)
        return self

    def _button_action(self, action, button=None):
        meth = getattr(self.source, action)
        meth(button)
        return self
