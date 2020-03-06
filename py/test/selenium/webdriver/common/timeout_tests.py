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

from selenium.webdriver.common.timeouts import Timeouts

def test_should_create_timeouts_object():
    implicit_wait = 10
    page_load = 10
    script = 10
    timeouts = Timeouts(implicit_wait=implicit_wait,page_load=page_load,script=script)

    assert implicit_wait == timeouts.implicit_wait
    assert page_load == timeouts.page_load
    assert script == timeouts.script

def test_should_error_if_implicit_wait_isnt_a_number():
    with pytest.raises(TypeError):
        Timeouts(implicit_wait="abc")

    timeout = Timeouts(implicit_wait=0)
    with pytest.raises(TypeError):
        timeout.implicit_wait="abc"


def test_should_error_if_page_load_isnt_a_number():
    with pytest.raises(TypeError):
        Timeouts(page_load="abc")
    
    timeout = Timeouts(page_load=0)
    with pytest.raises(TypeError):
        timeout.page_load = "abc"


def test_should_error_if_script_isnt_a_number():
    with pytest.raises(TypeError):
        Timeouts(script="abc")

    timeout = Timeouts(script=0)
    with pytest.raises(TypeError):
        timeout.script = "abc"


def test_should_get_timeouts_without_setting_them(driver):
    results = driver.timeouts
    assert results.implicit_wait == 0
    assert results.page_load == 300
    assert results.script == 30

def test_should_set_and_get_timeouts_on_remote_end(driver):
    timeout = Timeouts(implicit_wait=10)
    driver.timeouts = timeout
    result = driver.timeouts
    assert result.implicit_wait == timeout.implicit_wait