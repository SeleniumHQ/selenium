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
    describe Window, skip_unless: {bidi: false, reason: 'Not yet implemented with BiDi'} do
      after(:all) { reset_driver! }

      let(:window) { driver.manage.window }

      # WIP: control vs fix for Safari rect flakiness.
      # control = grow +10 from whatever size the window already has (overflows screen)
      # fix     = establish a known modest size with headroom first, then grow +10
      describe '#rect experiment' do
        5.times do |i|
          it "CONTROL grows from current size (run #{i + 1})" do
            rect = window.rect

            target_x = rect.x + 10
            target_y = rect.y + 10
            target_width = rect.width + 10
            target_height = rect.height + 10

            window.rect = Rectangle.new(target_x, target_y, target_width, target_height)
            wait.until { window.rect.x != rect.x && window.rect.y != rect.y }

            new_rect = window.rect
            expect(new_rect.x).to eq(target_x)
            expect(new_rect.y).to eq(target_y)
            expect(new_rect.width).to eq(target_width)
            expect(new_rect.height).to eq(target_height)
          end

          it "FIX establishes known size first (run #{i + 1})" do
            window.rect = Rectangle.new(50, 50, 600, 500)
            rect = window.rect

            target_x = rect.x + 10
            target_y = rect.y + 10
            target_width = rect.width + 10
            target_height = rect.height + 10

            window.rect = Rectangle.new(target_x, target_y, target_width, target_height)
            wait.until { window.rect.x != rect.x && window.rect.y != rect.y }

            new_rect = window.rect
            expect(new_rect.x).to eq(target_x)
            expect(new_rect.y).to eq(target_y)
            expect(new_rect.width).to eq(target_width)
            expect(new_rect.height).to eq(target_height)
          end
        end
      end
    end
  end
end
