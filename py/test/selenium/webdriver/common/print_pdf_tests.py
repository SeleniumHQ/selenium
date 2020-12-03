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

from selenium.webdriver.common.print_page_options import PrintOptions

START_INDEX = 0
END_INDEX = 5
PDF_MAGIC_NUMBER = 'JVBER'

@pytest.mark.xfail_chrome(reason='chrome needs a headless driver instance.', run=False)
def test_pdf_with_2_pages(driver, pages):
    firefox_print_options = PrintOptions()
    firefox_print_options.page_ranges = ['1-2']

    driver.get(pages.url("printPage.html"))
    firefox_base64code = driver.print_page(firefox_print_options)

    assert firefox_base64code[START_INDEX : END_INDEX] == PDF_MAGIC_NUMBER

@pytest.mark.xfail_chrome(reason='chrome needs a headless driver instance.', run=False)
def test_pdf_with_all_pages(driver, pages):
    driver.get(pages.url("printPage.html"))
    firefox_base64code = driver.print_page()

    assert firefox_base64code[START_INDEX : END_INDEX] == PDF_MAGIC_NUMBER

@pytest.mark.xfail_chrome(reason='chrome needs a headless driver instance.', run=False)
def test_valid_params(driver, pages):
    firefox_print_options = PrintOptions()

    firefox_print_options.page_ranges = ['1-2']
    firefox_print_options.orientation = 'landscape'
    firefox_print_options.width = 30
    
    driver.get(pages.url("printPage.html"))
    firefox_base64code = driver.print_page(firefox_print_options)

    assert firefox_base64code[START_INDEX : END_INDEX] == PDF_MAGIC_NUMBER
