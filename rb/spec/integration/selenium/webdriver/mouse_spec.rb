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
    not_compliant_on browser: [:safari, :firefox] do
      describe Mouse do
        it 'clicks an element' do
          driver.navigate.to url_for('formPage.html')
          driver.mouse.click driver.find_element(id: 'imageButton')
        end

        it 'can drag and drop' do
          driver.navigate.to url_for('droppableItems.html')

          draggable = long_wait.until do
            driver.find_element(id: 'draggable')
          end

          droppable = driver.find_element(id: 'droppable')

          driver.mouse.down draggable
          driver.mouse.move_to droppable
          driver.mouse.up droppable

          text = droppable.find_element(tag_name: 'p').text
          expect(text).to eq('Dropped!')
        end

        it 'double clicks an element' do
          driver.navigate.to url_for('javascriptPage.html')
          element = driver.find_element(id: 'doubleClickField')

          driver.mouse.double_click element

          wait(5).until do
            element.attribute(:value) == 'DoubleClicked'
          end
        end

        not_compliant_on browser: :phantomjs do
          it 'context clicks an element' do
            driver.navigate.to url_for('javascriptPage.html')
            element = driver.find_element(id: 'doubleClickField')

            driver.mouse.context_click element

            wait(5).until do
              element.attribute(:value) == 'ContextClicked'
            end
          end
        end
      end
    end
  end # WebDriver
end # Selenium
