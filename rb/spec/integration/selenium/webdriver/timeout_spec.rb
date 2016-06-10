# encoding: utf-8
#
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
          driver.find_element(id: 'box0')
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

        not_compliant_on browser: :marionette, platform: :windows do
          it 'should return after first attempt to find many after disabling implicit waits' do
            add = driver.find_element(id: 'adder')

            driver.manage.timeouts.implicit_wait = 3
            driver.manage.timeouts.implicit_wait = 0
            add.click

            expect(driver.find_elements(class_name: 'redbox')).to be_empty
          end
        end
      end

      context 'page loads' do
        after { driver.manage.timeouts.page_load = 0 }

        it 'should be able to set the page load timeout' do
          expect { driver.manage.timeouts.page_load = 2 }.to_not raise_exception
        end
      end
    end
  end # WebDriver
end # Selenium
