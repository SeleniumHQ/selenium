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
    describe ActionBuilder, skip_unless: {bidi: false, reason: 'Not yet implemented with BiDi'} do
      after { driver.action.clear_all_actions }

      describe '#double_click' do
        # WIP: nil = no pause inserted (baseline); others add a pause between the two clicks
        [nil, 50, 100, 150, 200].each do |pause_ms|
          label = pause_ms ? "#{pause_ms}ms pause" : 'no pause'

          5.times do |i|
            it "executes with equivalent pointer methods (#{label}, run #{i + 1})" do
              driver.navigate.to url_for('javascriptPage.html')
              element = driver.find_element(id: 'doubleClickField')

              action = driver.action.move_to(element)
                             .pointer_down(:left).pointer_up(:left)
              action.pause(duration: pause_ms / 1000.0) if pause_ms
              action.pointer_down(:left).pointer_up(:left).perform

              wait.until { element.property(:value) == 'DoubleClicked' }
              expect(element.property(:value)).to eq('DoubleClicked')
            end
          end
        end
      end
    end
  end
end
