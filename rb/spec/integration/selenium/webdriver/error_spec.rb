# frozen_string_literal: true

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

require_relative 'spec_helper'

module Selenium
  module WebDriver
    describe Error, exclusive: { bidi: false, reason: 'Not yet implemented with BiDi' } do
      let(:base_url) { 'https://www.selenium.dev/documentation/webdriver/troubleshooting/errors' }

      it 'raises an appropriate error' do
        driver.navigate.to url_for('xhtmlTest.html')

        expect {
          driver.find_element(id: 'nonexistent')
        }.to raise_error(WebDriver::Error::NoSuchElementError)
      end

      context 'with self generated url' do
        it 'provides the right url for NoSuchElementError' do
          driver.navigate.to url_for('xhtmlTest.html')

          expect {
            driver.find_element(id: 'nonexistent')
          }.to raise_error(Selenium::WebDriver::Error::NoSuchElementError, /#{base_url}#no-such-element-exception/)
        end

        it 'provides the right url for StaleElementReferenceError' do
          driver.navigate.to url_for('formPage.html')
          button = driver.find_element(id: 'imageButton')
          driver.navigate.refresh

          expect {
            button.click
          }.to raise_error(Selenium::WebDriver::Error::StaleElementReferenceError,
                           /#{base_url}#stale-element-reference-exception/)
        end

        it 'provides the right url for UnknownError' do
          driver.network_conditions = { offline: false, latency: 56, download_throughput: 789, upload_throughput: 600 }
          driver.delete_network_conditions

          expect {
            driver.network_conditions
          }.to raise_error(Selenium::WebDriver::Error::UnknownError, /#{base_url}#unknown-exception/)
        end

        it 'provides the right url for NoSuchAlertError' do
          expect {
            driver.switch_to.alert
          }.to raise_error(Selenium::WebDriver::Error::NoSuchAlertError, /#{base_url}#no-such-alert-exception/)
        end

        it 'provides the right url for ScriptTimeoutError' do
          expect {
            driver.execute_async_script 'return 1 + 2;'
          }.to raise_error(Selenium::WebDriver::Error::ScriptTimeoutError, /#{base_url}#script-timeout-exception/)
        end
      end
    end
  end # WebDriver
end # Selenium
