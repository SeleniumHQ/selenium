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
    compliant_on driver: :ff_nightly do
      describe W3CActionBuilder do
        describe 'Key actions' do
          it 'can release pressed keys via release action' do
            driver.navigate.to url_for('javascriptPage.html')

            event_input = driver.find_element(id: 'theworks')
            keylogger = driver.find_element(id: 'result')

            event_input.click

            driver.action.key_down(:shift).perform
            wait.until { keylogger.text.include? 'down' }
            expect(keylogger.text).to match(/keydown *$/)

            driver.action.release_actions
            wait.until { keylogger.text.include? 'up' }
            expect(keylogger.text).to match(/keyup *$/)
          end
        end # Key actions

        describe 'Pointer actions' do
          not_compliant_on driver: :ff_nightly do
            it 'can release pressed buttons via release action' do
              driver.navigate.to url_for('javascriptPage.html')

              event_input = driver.find_element(id: 'clickField')

              driver.action.pointer_down(event_input).perform
              expect(event_input.attribute(:value)).to eq('Hello')

              driver.action.release_actions
              expect(event_input.attribute(:value)).to eq('Clicked')
            end
          end # Guard
        end # Pointer actions
      end # ActionBuilder
    end # Guard
  end # WebDriver
end # Selenium
