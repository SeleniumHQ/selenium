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
    describe W3CActionBuilder, only: {browser: %i[firefox ie]} do
      after do
        if driver.action.respond_to?(:clear_all_actions)
          driver.action.clear_all_actions
        else
          driver.action.instance_variable_set(:@actions, [])
        end
      end

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
        it 'can release pressed buttons via release action', except: {browser: :ie} do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'clickField')

          driver.action.move_to(event_input).pointer_down(:left).perform
          expect(event_input.attribute(:value)).to eq('Hello')

          driver.action.release_actions
          expect(event_input.attribute(:value)).to eq('Clicked')
        end
      end
    end # W3CActionBuilder
  end # WebDriver
end # Selenium
