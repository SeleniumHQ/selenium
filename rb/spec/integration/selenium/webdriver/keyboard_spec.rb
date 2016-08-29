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
    # Firefox - "Actions Endpoint Not Yet Implemented"
    not_compliant_on browser: [:safari, :ff_legacy, :firefox] do
      describe Keyboard do
        # Edge - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8339952
        not_compliant_on browser: :edge do
          it 'sends keys to the active element' do
            driver.navigate.to url_for('bodyTypingTest.html')

            driver.keyboard.send_keys 'ab'

            text = driver.find_element(id: 'body_result').text.strip
            expect(text).to eq('keypress keypress')

            expect(driver.find_element(id: 'result').text.strip).to be_empty
          end
        end

        # Edge - https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8339952
        not_compliant_on browser: :edge do
          it 'can send keys with shift pressed' do
            driver.navigate.to url_for('javascriptPage.html')

            event_input = driver.find_element(id: 'theworks')
            keylogger = driver.find_element(id: 'result')

            driver.mouse.click event_input

            driver.keyboard.press :shift
            driver.keyboard.send_keys 'ab'
            driver.keyboard.release :shift

            expect(event_input.attribute(:value)).to eq('AB')
            expect(keylogger.text.strip).to match(/^(focus )?keydown keydown keypress keyup keydown keypress keyup keyup$/)
          end
        end

        it 'raises an ArgumentError if the pressed key is not a modifier key' do
          expect { driver.keyboard.press :return }.to raise_error(ArgumentError)
        end

        it 'can press and release modifier keys' do
          driver.navigate.to url_for('javascriptPage.html')

          event_input = driver.find_element(id: 'theworks')
          keylogger = driver.find_element(id: 'result')

          driver.mouse.click event_input

          driver.keyboard.press :shift
          expect(keylogger.text).to match(/keydown *$/)

          driver.keyboard.release :shift
          expect(keylogger.text).to match(/keyup *$/)
        end
      end
    end
  end # WebDriver
end # Selenium
