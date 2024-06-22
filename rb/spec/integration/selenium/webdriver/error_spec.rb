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
    describe Error, exclusive: {bidi: false, reason: 'Not yet implemented with BiDi'} do
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
          driver.find_element(id: 'nonexistent')
        rescue WebDriver::Error::NoSuchElementError => e
          expect(e.message).to include("#{base_url}#no-such-element-exception")
        end
      end
    end
  end # WebDriver
end # Selenium
