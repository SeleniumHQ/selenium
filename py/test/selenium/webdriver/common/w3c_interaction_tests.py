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

import pytest

from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.key_actions import KeyActions


def test_should_be_able_to_get_pointer_and_keyboard_inputs(driver, pages):
    actions = ActionBuilder(driver)
    pointers = actions.pointer_inputs
    keyboards = actions.key_inputs

    assert pointers is not None
    assert keyboards is not None


def testSendingKeysToActiveElementWithModifier(driver, pages):
    pages.load("formPage.html")
    e = driver.find_element_by_id("working")
    e.click()

    actions = ActionBuilder(driver)
    key_action = actions.key_action
    key_action.key_down(Keys.SHIFT) \
        .send_keys("abc") \
        .key_up(Keys.SHIFT)

    actions.perform()

    assert "ABC" == e.get_attribute('value')


def test_can_create_pause_action_on_keyboard(driver, pages):
    # If we don't get an error and takes less than 3 seconds to run, we are good
    import datetime
    start = datetime.datetime.now()
    actions1 = ActionBuilder(driver)
    key_actions = actions1.key_action
    key_actions.pause(1)
    actions1.perform()
    finish = datetime.datetime.now()
    assert (finish - start).seconds < 3

    # Add a filler step
    actions2 = ActionBuilder(driver)
    key_action = actions2.key_action
    key_action.pause()
    actions2.perform()


def test_can_create_pause_action_on_pointer(driver, pages):
    # If we don't get an error and takes less than 3 seconds to run, we are good
    # Disabled until pointer actions lands in marionette
    # import datetime
    # start = datetime.datetime.now()
    # actions1 = ActionBuilder(driver)
    # key_actions = actions1.pointer_action
    # key_actions.pause(1)
    # actions1.perform()
    # finish = datetime.datetime.now()
    # assert (finish - start).seconds < 3

    # Add a filler step
    actions2 = ActionBuilder(driver)
    key_action = actions2.pointer_action
    key_action.pause()
    actions2.perform()


def test_can_clear_actions(driver, pages):
    actions = ActionBuilder(driver)
    actions.clear_actions()
