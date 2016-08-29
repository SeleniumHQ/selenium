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
import unittest
from selenium.common.exceptions import NoSuchElementException, ElementNotSelectableException, UnexpectedTagNameException
from selenium.webdriver.support.ui import Select
from selenium.webdriver.common.by import By


def not_available_on_remote(func):
    def testMethod(self):
        print(self.driver)
        if type(self.driver) == 'remote':
            return lambda x: None
        else:
            return func(self)
    return testMethod

disabledSelect = {'name': 'no-select', 'values': ['Foo']}
singleSelectValues1 = {'name': 'selectomatic', 'values': ['One', 'Two', 'Four', 'Still learning how to count, apparently']}
singleSelectValues2 = {'name': 'redirect', 'values': ['One', 'Two']}
singleSelectValuesWithSpaces = {'name': 'select_with_spaces', 'values': ['One', 'Two', 'Four', 'Still learning how to count, apparently']}
multiSelectValues1 = {'name': 'multi', 'values': ['Eggs', 'Ham', 'Sausages', 'Onion gravy']}
multiSelectValues2 = {'name': 'select_empty_multiple', 'values': ['select_1', 'select_2', 'select_3', 'select_4']}


@pytest.mark.ignore_marionette
class WebDriverSelectSupportTests(unittest.TestCase):

    def testSelectByIndexSingle(self):
        self._loadPage("formPage")

        for select in [singleSelectValues1]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            for x in range(len(select['values'])):
                sel.select_by_index(x)
                self.assertEqual(sel.first_selected_option.text, select['values'][x])

    @pytest.mark.xfail
    # disabled select isn't immediatedly throwing an ElementNotSelectableException when trying to select
    def testSelectDisabledByIndexShouldThrowException(self):
        self._loadPage("formPage")

        try:
            sel = Select(self.driver.find_element(By.NAME, disabledSelect['name']))
            sel.select_by_index(0)
            raise Exception("Didn't get an expected ElementNotSelectableException exception.")
        except ElementNotSelectableException:
            pass  # should get this exception

    def testSelectByValueSingle(self):
        if self.driver.capabilities['browserName'] == 'chrome':
            pytest.xfail("chrome currently doesn't allow css selectors with comma's in them that are not compound")
        self._loadPage("formPage")

        for select in [singleSelectValues1]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            for x in range(len(select['values'])):
                sel.select_by_value(select['values'][x].lower())
                self.assertEqual(sel.first_selected_option.text, select['values'][x])

    # disabled select isn't immediatedly throwing an ElementNotSelectableException when trying to select
    @pytest.mark.xfail
    def testSelectDisabledByValueShouldThrowException(self):
        self._loadPage("formPage")

        try:
            sel = Select(self.driver.find_element(By.NAME, disabledSelect['name']))
            sel.select_by_value('foo')
            raise Exception("Didn't get an expected ElementNotSelectableException exception.")
        except ElementNotSelectableException:
            pass

    def testSelectByVisibleTextSingle(self):
        self._loadPage("formPage")

        for select in [singleSelectValues1]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            for x in range(len(select['values'])):
                print(select['values'][x])
                sel.select_by_visible_text(select['values'][x])
                self.assertEqual(sel.first_selected_option.text, select['values'][x])

    def testSelectByVisibleTextShouldNormalizeSpaces(self):
        if self.driver.capabilities['browserName'] == 'phantomjs':
            pytest.xfail("phantomjs does not normalize spaces in text")
        self._loadPage("formPage")

        for select in [singleSelectValuesWithSpaces]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            for x in range(len(select['values'])):
                print(select['values'][x])
                sel.select_by_visible_text(select['values'][x])
                self.assertEqual(sel.first_selected_option.text, select['values'][x])

    @pytest.mark.xfail
    # disabled select isn't immediatedly throwing an ElementNotSelectableException when trying to select
    def testSelectDisabledByVisibleTextShouldThrowException(self):
        self._loadPage("formPage")

        try:
            sel = Select(self.driver.find_element(By.NAME, disabledSelect['name']))
            sel.select_by_visible_text('foo')
            raise Exception("Didn't get an expected ElementNotSelectableException exception.")
        except ElementNotSelectableException:
            pass

    def testSelectByIndexMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")

        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            for x in range(len(select['values'])):
                sel.select_by_index(x)
                selected = sel.all_selected_options
                self.assertEqual(len(selected), x + 1)
                for j in range(len(selected)):
                    self.assertEqual(selected[j].text, select['values'][j])

    def testSelectByValueMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")

        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            for x in range(len(select['values'])):
                sel.select_by_value(select['values'][x].lower())
                selected = sel.all_selected_options
                self.assertEqual(len(selected), x + 1)
                for j in range(len(selected)):
                    self.assertEqual(selected[j].text, select['values'][j])

    def testSelectByVisibleTextMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")

        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            for x in range(len(select['values'])):
                sel.select_by_visible_text(select['values'][x])
                selected = sel.all_selected_options
                self.assertEqual(len(selected), x + 1)
                for j in range(len(selected)):
                    self.assertEqual(selected[j].text, select['values'][j])

    def testDeselectAllSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_all()
                raise Exception("Didn't get an expected NotImplementedError.")
            except NotImplementedError:
                pass  # should get this exception

    def testDeselectAllMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            self.assertEqual(len(sel.all_selected_options), 0)

    def testDeselectByIndexSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_index(0)
                raise Exception("Didn't get an expected NotImplementedError.")
            except NotImplementedError:
                pass  # should get this exception

    def testDeselectByValueSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_value(select['values'][0].lower())
                raise Exception("Didn't get an expected NotImplementedError.")
            except NotImplementedError:
                pass  # should get this exception

    def testDeselectByVisibleTextSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_visible_text(select['values'][0])
                raise Exception("Didn't get an expected NotImplementedError.")
            except NotImplementedError:
                pass  # should get this exception

    def testDeselectByIndexMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            sel.select_by_index(0)
            sel.select_by_index(1)
            sel.select_by_index(2)
            sel.select_by_index(3)
            sel.deselect_by_index(1)
            sel.deselect_by_index(3)
            selected = sel.all_selected_options
            self.assertEqual(len(selected), 2)
            self.assertEqual(selected[0].text, select['values'][0])
            self.assertEqual(selected[1].text, select['values'][2])

    def testDeselectByValueMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            sel.select_by_index(0)
            sel.select_by_index(1)
            sel.select_by_index(2)
            sel.select_by_index(3)
            sel.deselect_by_value(select['values'][1].lower())
            sel.deselect_by_value(select['values'][3].lower())
            selected = sel.all_selected_options
            self.assertEqual(len(selected), 2)
            self.assertEqual(selected[0].text, select['values'][0])
            self.assertEqual(selected[1].text, select['values'][2])

    def testDeselectByVisibleTextMultiple(self):
        if self.driver.capabilities['browserName'] == 'chrome' and int(self.driver.capabilities['version'].split('.')[0]) < 16:
            pytest.skip("deselecting preselected values only works on chrome >= 16")
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            sel = Select(self.driver.find_element(By.NAME, select['name']))
            sel.deselect_all()
            sel.select_by_index(0)
            sel.select_by_index(1)
            sel.select_by_index(2)
            sel.select_by_index(3)
            sel.deselect_by_visible_text(select['values'][1])
            sel.deselect_by_visible_text(select['values'][3])
            selected = sel.all_selected_options
            self.assertEqual(len(selected), 2)
            self.assertEqual(selected[0].text, select['values'][0])
            self.assertEqual(selected[1].text, select['values'][2])

    def testGetOptions(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2, multiSelectValues1, multiSelectValues2]:
            opts = Select(self.driver.find_element(By.NAME, select['name'])).options
            self.assertEqual(len(opts), len(select['values']))
            for i in range(len(opts)):
                self.assertEqual(opts[i].text, select['values'][i])

    def testGetAllSelectedOptionsSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2, disabledSelect]:
            opts = Select(self.driver.find_element(By.NAME, select['name'])).all_selected_options
            self.assertEqual(len(opts), 1)
            self.assertEqual(opts[0].text, select['values'][0])

    def testGetAllSelectedOptionsMultiple(self):
        self._loadPage("formPage")
        opts = Select(self.driver.find_element(By.NAME, multiSelectValues1['name'])).all_selected_options
        self.assertEqual(len(opts), 2)
        self.assertEqual(opts[0].text, multiSelectValues1['values'][0])
        self.assertEqual(opts[1].text, multiSelectValues1['values'][2])
        opts = Select(self.driver.find_element(By.NAME, multiSelectValues2['name'])).all_selected_options
        self.assertEqual(len(opts), 0)

    def testGetFirstSelectedOptionSingle(self):
        self._loadPage("formPage")
        for select in [singleSelectValues1, singleSelectValues2]:
            opt = Select(self.driver.find_element(By.NAME, select['name'])).first_selected_option
            self.assertEqual(opt.text, select['values'][0])

    def testGetFirstSelectedOptionMultiple(self):
        self._loadPage("formPage")
        opt = Select(self.driver.find_element(By.NAME, multiSelectValues1['name'])).first_selected_option
        self.assertEqual(opt.text, multiSelectValues1['values'][0])
        opt = Select(self.driver.find_element(By.NAME, multiSelectValues2['name'])).all_selected_options
        self.assertEqual(len(opt), 0)

    def testRaisesExceptionForInvalidTagName(self):
        self._loadPage("formPage")
        try:
            Select(self.driver.find_element(By.TAG_NAME, "div"))
            raise Exception("Should have gotten an UnexpectedTagNameException to be raised")
        except UnexpectedTagNameException:
            pass

    def testDeselectByIndexNonExistent(self):
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_index(10)
                raise Exception("Should have gotten an NoSuchElementException to be raised.")
            except NoSuchElementException:
                pass  # should get this exception

    def testDeselectByValueNonExistent(self):
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_value('not there')
                raise Exception("Should have gotten an NoSuchElementException to be raised.")
            except NoSuchElementException:
                pass  # should get this exception

    def testDeselectByTextNonExistent(self):
        self._loadPage("formPage")
        for select in [multiSelectValues1, multiSelectValues2]:
            try:
                Select(self.driver.find_element(By.NAME, select['name'])).deselect_by_visible_text('not there')
                raise Exception("Should have gotten an NoSuchElementException to be raised.")
            except NoSuchElementException:
                pass  # should get this exception

    def _pageURL(self, name):
        return self.webserver.where_is(name + '.html')

    def _loadPage(self, name):
        self.driver.get(self._pageURL(name))
