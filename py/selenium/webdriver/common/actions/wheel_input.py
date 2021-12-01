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
from . import interaction
from .input_device import InputDevice
from typing import Union

from selenium.webdriver.remote.webelement import WebElement


class WheelInput(InputDevice):

    def __init__(self, name) -> None:
        super().__init__(name=name)
        self.name = name
        self.type = interaction.WHEEL

    def encode(self) -> dict:
        return {"type": self.type,
                "id": self.name,
                "actions": [acts for acts in self.actions]}

    def create_scroll(self, x: int, y: int, delta_x: int,
                      delta_y: int, duration: int, origin) -> None:
        if isinstance(origin, WebElement):
            origin = {"element-6066-11e4-a52e-4f735466cecf": origin.id}
        self.add_action({"type": "scroll", "x": x, "y": y, "deltaX": delta_x,
                         "deltaY": delta_y, "duration": duration,
                         "origin": origin})

    def create_pause(self, pause_duration: Union[int, float]) -> None:
        self.add_action(
            {"type": "pause", "duration": int(pause_duration * 1000)})
