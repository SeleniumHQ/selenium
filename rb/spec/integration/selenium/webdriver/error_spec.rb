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
      it 'raises an appropriate error' do
        driver.navigate.to url_for('xhtmlTest.html')

        expect {
          driver.find_element(id: 'nonexistent')
        }.to raise_error(WebDriver::Error::NoSuchElementError, /#no-such-element-exception/)
      end

      it 'has backtrace locations' do
        driver.find_element(id: 'nonexistent')
      rescue WebDriver::Error::NoSuchElementError => e
        expect(e.backtrace_locations).not_to be_empty
      end

      it 'has cause' do
        driver.find_element(id: 'nonexistent')
      rescue WebDriver::Error::NoSuchElementError => e
        expect(e.cause).to be_a(WebDriver::Error::WebDriverError)
      end

      it 'has backtrace' do
        driver.find_element(id: 'nonexistent')
      rescue WebDriver::Error::NoSuchElementError => e
        expect(e.backtrace).not_to be_empty
      end

      it 'has backtrace when using a remote server', only: {driver: :remote,
                                                            reason: 'This test should only apply to remote drivers'} do
        unless driver.is_a?(WebDriver::Remote::Driver)
          raise 'This error needs to be risen for the pending test not to fail on local drivers'
        end

        driver.send(:bridge).instance_variable_set(:@session_id, 'fake_session_id')
        driver.window_handle
      rescue WebDriver::Error::InvalidSessionIdError => e
        expect(e.backtrace).not_to be_empty
      end
    end
  end # WebDriver
end # Selenium
