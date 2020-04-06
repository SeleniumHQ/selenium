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
    describe Timeouts do
      context 'implicit waits' do
        before do
          driver.manage.timeouts.implicit_wait = 0
          driver.navigate.to url_for('dynamic.html')
        end

        after { driver.manage.timeouts.implicit_wait = 0 }

        it 'should implicitly wait for a single element' do
          driver.manage.timeouts.implicit_wait = 6

          driver.find_element(id: 'adder').click
          expect { driver.find_element(id: 'box0') }.not_to raise_error
        end

        it 'should still fail to find an element with implicit waits enabled' do
          driver.manage.timeouts.implicit_wait = 0.5
          expect { driver.find_element(id: 'box0') }.to raise_error(WebDriver::Error::NoSuchElementError)
        end

        it 'should return after first attempt to find one after disabling implicit waits' do
          driver.manage.timeouts.implicit_wait = 3
          driver.manage.timeouts.implicit_wait = 0

          expect { driver.find_element(id: 'box0') }.to raise_error(WebDriver::Error::NoSuchElementError)
        end

        it 'should implicitly wait until at least one element is found when searching for many' do
          add = driver.find_element(id: 'adder')

          driver.manage.timeouts.implicit_wait = 6
          add.click
          add.click

          expect(driver.find_elements(class_name: 'redbox')).not_to be_empty
        end

        it 'should still fail to find elements when implicit waits are enabled' do
          driver.manage.timeouts.implicit_wait = 0.5
          expect(driver.find_elements(class_name: 'redbox')).to be_empty
        end

        it 'should return after first attempt to find many after disabling implicit waits', except: {browser: :firefox, platform: :windows} do
          add = driver.find_element(id: 'adder')

          driver.manage.timeouts.implicit_wait = 3
          driver.manage.timeouts.implicit_wait = 0
          add.click

          expect(driver.find_elements(class_name: 'redbox')).to be_empty
        end
      end

      context 'page loads' do
        before { driver.manage.timeouts.page_load = 2 }

        after { driver.manage.timeouts.page_load = 300 }

        it 'should timeout if page takes too long to load' do
          expect { driver.navigate.to url_for('sleep?time=3') }.to raise_error(WebDriver::Error::TimeoutError)
        end

        it 'should timeout if page takes too long to load after click' do
          driver.navigate.to url_for('page_with_link_to_slow_loading_page.html')

          expect { driver.find_element(id: 'link-to-slow-loading-page').click }.to raise_error(WebDriver::Error::TimeoutError)
        end
      end
    end
  end # WebDriver
end # Selenium
