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

from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.key_input import KeyInput
from selenium.webdriver.common.actions.pointer_input import PointerInput
from selenium.webdriver.common.actions.wheel_input import WheelInput

NO_DRIVER = None


def test_uses_passed_devices_in_place_of_defaults_by_type():
    mouse = PointerInput(interaction.POINTER_MOUSE, "test mouse")
    keyboard = KeyInput("test keyboard")
    wheel = WheelInput("test wheel")

    actions = ActionChains(NO_DRIVER, devices=[wheel, keyboard, mouse])

    assert actions.w3c_actions.devices == [mouse, keyboard, wheel]


def test_creates_default_devices_for_kinds_not_passed():
    keyboard = KeyInput("test keyboard")

    actions = ActionChains(NO_DRIVER, devices=[keyboard])

    assert [device.name for device in actions.w3c_actions.devices] == ["mouse", "test keyboard", "wheel"]


def test_records_actions_on_passed_devices():
    mouse = PointerInput(interaction.POINTER_MOUSE, "test mouse")
    keyboard = KeyInput("test keyboard")
    wheel = WheelInput("test wheel")

    ActionChains(NO_DRIVER, devices=[mouse, keyboard, wheel]).click().key_down("a").scroll_by_amount(0, 200)

    assert mouse.actions
    assert keyboard.actions
    assert wheel.actions
