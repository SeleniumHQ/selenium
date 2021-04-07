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

from selenium.common.exceptions import (
    NoSuchElementException,
    UnexpectedTagNameException)
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By

disabledSelect = {'name': 'no-select', 'values': ['Foo']}
singleSelectValues1 = {'name': 'selectomatic', 'values': ['One', 'Two', 'Four', 'Still learning how to count, apparently']}
singleSelectValues2 = {'name': 'redirect', 'values': ['One', 'Two']}
singleSelectValuesWithSpaces = {'name': 'select_with_spaces', 'values': ['One', 'Two', 'Four', 'Still learning how to count, apparently']}
multiSelectValues1 = {'name': 'multi', 'values': ['Eggs', 'Ham', 'Sausages', 'Onion gravy']}
multiSelectValues2 = {'name': 'select_empty_multiple', 'values': ['select_1', 'select_2', 'select_3', 'select_4']}


def testSelectByIndexSingle(driver, pages):
    pages.load("formPage.html")

    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        for x in range(len(select['values'])):
            sel.select_by_index(x)
            assert sel.first_selected_option.text == select['values'][x]


@pytest.mark.xfail_firefox(reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1429403')
@pytest.mark.xfail_remote
def testSelectDisabledByIndex(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSelect['name']))
    selected = sel.first_selected_option
    sel.select_by_index(1)
    assert selected == sel.first_selected_option


def testSelectByValueSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        for x in range(len(select['values'])):
            sel.select_by_value(select['values'][x].lower())
            assert sel.first_selected_option.text == select['values'][x]


@pytest.mark.xfail_firefox(reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1429403')
@pytest.mark.xfail_remote
def testSelectDisabledByValue(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSelect['name']))
    selected = sel.first_selected_option
    sel.select_by_value('bar')
    assert selected == sel.first_selected_option


def testSelectByVisibleTextSingle(driver, pages):
    pages.load("formPage.html")

    for select in [singleSelectValues1]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        for x in range(len(select['values'])):
            print(select['values'][x])
            sel.select_by_visible_text(select['values'][x])
            assert sel.first_selected_option.text == select['values'][x]


# @pytest.mark.xfail_chrome(
#     reason='https://bugs.chromium.org/p/chromedriver/issues/detail?id=822')
# @pytest.mark.xfail_chromiumedge(
#     reason='https://bugs.chromium.org/p/chromedriver/issues/detail?id=822')
# @pytest.mark.xfail_safari
# def testSelectByVisibleTextShouldNormalizeSpaces(driver, pages):
#     pages.load("formPage.html")

#     for select in [singleSelectValuesWithSpaces]:
#         sel = Select(driver.find_element(By.NAME, select['name']))
#         for x in range(len(select['values'])):
#             print(select['values'][x])
#             sel.select_by_visible_text(select['values'][x])
#             assert sel.first_selected_option.text == select['values'][x]


@pytest.mark.xfail_firefox(reason='https://bugzilla.mozilla.org/show_bug.cgi?id=1429403')
@pytest.mark.xfail_remote
def testSelectDisabledByVisibleText(driver, pages):
    pages.load("formPage.html")
    sel = Select(driver.find_element(By.NAME, disabledSelect['name']))
    selected = sel.first_selected_option
    sel.select_by_visible_text('Bar')
    assert selected == sel.first_selected_option


def testSelectByIndexMultiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        for x in range(len(select['values'])):
            sel.select_by_index(x)
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select['values'][j]


def testSelectByValueMultiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        for x in range(len(select['values'])):
            sel.select_by_value(select['values'][x].lower())
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select['values'][j]


def testSelectByVisibleTextMultiple(driver, pages):
    pages.load("formPage.html")

    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        for x in range(len(select['values'])):
            sel.select_by_visible_text(select['values'][x])
            selected = sel.all_selected_options
            assert len(selected) == x + 1
            for j in range(len(selected)):
                assert selected[j].text == select['values'][j]


def testDeselectAllSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select['name'])).deselect_all()


def testDeselectAllMultiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        assert len(sel.all_selected_options) == 0


def testDeselectByIndexSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_index(0)


def testDeselectByValueSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_value(select['values'][0].lower())


def testDeselectByVisibleTextSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        with pytest.raises(NotImplementedError):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_visible_text(select['values'][0])


def testDeselectByIndexMultiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_index(1)
        sel.deselect_by_index(3)
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select['values'][0]
        assert selected[1].text == select['values'][2]


def testDeselectByValueMultiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_value(select['values'][1].lower())
        sel.deselect_by_value(select['values'][3].lower())
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select['values'][0]
        assert selected[1].text == select['values'][2]


def testDeselectByVisibleTextMultiple(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        sel = Select(driver.find_element(By.NAME, select['name']))
        sel.deselect_all()
        sel.select_by_index(0)
        sel.select_by_index(1)
        sel.select_by_index(2)
        sel.select_by_index(3)
        sel.deselect_by_visible_text(select['values'][1])
        sel.deselect_by_visible_text(select['values'][3])
        selected = sel.all_selected_options
        assert len(selected) == 2
        assert selected[0].text == select['values'][0]
        assert selected[1].text == select['values'][2]


def testGetOptions(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2, multiSelectValues1, multiSelectValues2]:
        opts = Select(driver.find_element(By.NAME, select['name'])).options
        assert len(opts) == len(select['values'])
        for i in range(len(opts)):
            assert opts[i].text == select['values'][i]


def testGetAllSelectedOptionsSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2, disabledSelect]:
        opts = Select(driver.find_element(By.NAME, select['name'])).all_selected_options
        assert len(opts) == 1
        assert opts[0].text == select['values'][0]


def testGetAllSelectedOptionsMultiple(driver, pages):
    pages.load("formPage.html")
    opts = Select(driver.find_element(By.NAME, multiSelectValues1['name'])).all_selected_options
    assert len(opts) == 2
    assert opts[0].text, multiSelectValues1['values'][0]
    assert opts[1].text, multiSelectValues1['values'][2]
    opts = Select(driver.find_element(By.NAME, multiSelectValues2['name'])).all_selected_options
    assert len(opts) == 0


def testGetFirstSelectedOptionSingle(driver, pages):
    pages.load("formPage.html")
    for select in [singleSelectValues1, singleSelectValues2]:
        opt = Select(driver.find_element(By.NAME, select['name'])).first_selected_option
        assert opt.text == select['values'][0]


def testGetFirstSelectedOptionMultiple(driver, pages):
    pages.load("formPage.html")
    opt = Select(driver.find_element(By.NAME, multiSelectValues1['name'])).first_selected_option
    assert opt.text == multiSelectValues1['values'][0]
    opt = Select(driver.find_element(By.NAME, multiSelectValues2['name'])).all_selected_options
    assert len(opt) == 0


def testRaisesExceptionForInvalidTagName(driver, pages):
    pages.load("formPage.html")
    with pytest.raises(UnexpectedTagNameException):
        Select(driver.find_element(By.TAG_NAME, "div"))


def testDeselectByIndexNonExistent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_index(10)


def testDeselectByValueNonExistent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_value('not there')


def testDeselectByTextNonExistent(driver, pages):
    pages.load("formPage.html")
    for select in [multiSelectValues1, multiSelectValues2]:
        with pytest.raises(NoSuchElementException):
            Select(driver.find_element(By.NAME, select['name'])).deselect_by_visible_text('not there')
