# -*- coding: utf-8 -*-

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


def testShouldGetSingleClass(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('single-class')
    assert element.css_classes == ['single-class']


def testShouldGetMultipleClasses(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('multiple-classes')
    assert element.css_classes == ['this', 'has', 'multiple', 'classes']


def testShouldGetNoClass(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('no-class')
    assert element.css_classes == []


def testShouldGetEmptyClass(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('empty-class')
    assert element.css_classes == []


def testShouldIgnoreLeadingWhitespace(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('leading-whitespace-class')
    assert element.css_classes == ['leading-whitespace']


def testShouldIgnoreOnlyWhitespace(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('only-whitespace-class')
    assert element.css_classes == []


def testShouldIgnoreInternalWhitespace(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('internal-whitespace-class')
    assert element.css_classes == ['some', 'internal', 'whitespace']


def testShouldIgnoreTrailingWhitespace(driver, pages):
    pages.load("classes.html")
    element = driver.find_element_by_id('trailing-whitespace-class')
    assert element.css_classes == ['trailing-whitespace']
