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
import pytest

from selenium.common.exceptions import WebDriverException
from selenium.webdriver.support.wait import WebDriverWait


@pytest.mark.xfail_ie
@pytest.mark.xfail_chrome(reason="Fails on Travis")
@pytest.mark.xfail_marionette(reason="Fails on Travis")
@pytest.mark.xfail_firefox(reason="Fails on Travis")
@pytest.mark.xfail_remote(reason="Fails on Travis")
def testShouldMaximizeTheWindow(driver):
    resize_timeout = 5
    wait = WebDriverWait(driver, resize_timeout)
    old_size = driver.get_window_size()
    driver.set_window_size(200, 200)
    wait.until(
        lambda dr: dr.get_window_size() != old_size if old_size["width"] != 200 and old_size["height"] != 200 else True)
    size = driver.get_window_size()
    driver.maximize_window()
    wait.until(lambda dr: dr.get_window_size() != size)
    new_size = driver.get_window_size()
    assert new_size["width"] > size["width"]
    assert new_size["height"] > size["height"]


def test_should_get_the_size_of_the_current_window(driver):
    size = driver.get_window_size()
    assert size.get('width') > 0
    assert size.get('height') > 0


def test_should_set_the_size_of_the_current_window(driver):
    size = driver.get_window_size()

    target_width = size.get('width') - 20
    target_height = size.get('height') - 20
    driver.set_window_size(width=target_width, height=target_height)

    new_size = driver.get_window_size()
    assert new_size.get('width') == target_width
    assert new_size.get('height') == target_height


def test_should_get_the_position_of_the_current_window(driver):
    position = driver.get_window_position()
    assert position.get('x') >= 0
    assert position.get('y') >= 0


def test_should_set_the_position_of_the_current_window(driver):
    position = driver.get_window_position()

    target_x = position.get('x') + 10
    target_y = position.get('y') + 10
    driver.set_window_position(x=target_x, y=target_y)

    WebDriverWait(driver, 2).until(lambda d: d.get_window_position()['x'] != position['x'] and
                                   d.get_window_position()['y'] != position['y'])

    new_position = driver.get_window_position()
    assert new_position.get('x') == target_x
    assert new_position.get('y') == target_y


@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='Get Window Rect command not implemented')
@pytest.mark.xfail_safari(raises=WebDriverException,
                          reason='Get Window Rect command not implemented')
def test_should_get_the_rect_of_the_current_window(driver):
    rect = driver.get_window_rect()
    assert rect.get('x') >= 0
    assert rect.get('y') >= 0
    assert rect.get('width') >= 0
    assert rect.get('height') >= 0


@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='Get Window Rect command not implemented')
@pytest.mark.xfail_safari(raises=WebDriverException,
                          reason='Get Window Rect command not implemented')
def test_should_set_the_rect_of_the_current_window(driver):
    rect = driver.get_window_rect()

    target_x = rect.get('x') + 10
    target_y = rect.get('y') + 10
    target_width = rect.get('width') + 10
    target_height = rect.get('height') + 10

    driver.set_window_rect(x=target_x, y=target_y, width=target_width, height=target_height)

    WebDriverWait(driver, 2).until(lambda d: d.get_window_position()['x'] != rect['x'] and
                                   d.get_window_position()['y'] != rect['y'])

    new_rect = driver.get_window_rect()

    assert new_rect.get('x') == target_x
    assert new_rect.get('y') == target_y
    assert new_rect.get('width') == target_width
    assert new_rect.get('height') == target_height


@pytest.mark.xfail_chrome(raises=WebDriverException,
                          reason='Fullscreen command not implemented')
@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='Fullscreen command not implemented')
@pytest.mark.xfail_safari(raises=WebDriverException,
                          reason='Fullscreen command not implemented')
@pytest.mark.skipif(os.environ.get('CI') == 'true',
                    reason='Fullscreen command causes Travis to hang')
def test_should_fullscreen_the_current_window(driver):
    start_width = driver.execute_script('return window.innerWidth;')
    start_height = driver.execute_script('return window.innerHeight;')

    driver.fullscreen_window()

    WebDriverWait(driver, 2).until(lambda d: driver.execute_script('return window.innerWidth;') >
                                   start_width)

    end_width = driver.execute_script('return window.innerWidth;')
    end_height = driver.execute_script('return window.innerHeight;')

    driver.fullscreen_window()  # Restore to original size

    assert end_width > start_width
    assert end_height > start_height


@pytest.mark.xfail_chrome(raises=WebDriverException,
                          reason='Minimize command not implemented')
@pytest.mark.xfail_firefox(raises=WebDriverException,
                           reason='Minimize command not implemented')
@pytest.mark.xfail_safari(raises=WebDriverException,
                          reason='Minimize command not implemented')
@pytest.mark.skipif(os.environ.get('CI') == 'true',
                    reason='Minimize command causes Travis to hang')
@pytest.mark.no_driver_after_test
def test_should_minimize_the_current_window(driver):
    driver.minimize_window()
    minimized = driver.execute_script('return document.hidden;')
    driver.quit()  # Kill driver so we aren't running minimized after

    assert minimized is True
