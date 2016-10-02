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
    # Remote w3c bug: https://github.com/SeleniumHQ/selenium/issues/2856
    not_compliant_on driver: :remote, browser: :firefox do
      describe Window do
        let(:window) { driver.manage.window }

        it 'gets the size of the current window' do
          size = window.size

          expect(size).to be_kind_of(Dimension)

          expect(size.width).to be > 0
          expect(size.height).to be > 0
        end

        it 'sets the size of the current window' do
          size = window.size

          target_width = size.width - 20
          target_height = size.height - 20

          window.size = Dimension.new(target_width, target_height)

          new_size = window.size
          expect(new_size.width).to eq(target_width)
          expect(new_size.height).to eq(target_height)
        end

        not_compliant_on browser: :firefox do
          it 'gets the position of the current window' do
            pos = driver.manage.window.position

            expect(pos).to be_kind_of(Point)

            expect(pos.x).to be >= 0
            expect(pos.y).to be >= 0
          end
        end

        not_compliant_on browser: [:phantomjs, :firefox] do
          it 'sets the position of the current window' do
            pos = window.position

            target_x = pos.x + 10
            target_y = pos.y + 10

            window.position = Point.new(target_x, target_y)

            wait.until { window.position.x != pos.x && window.position.y != pos.y }

            new_pos = window.position
            expect(new_pos.x).to eq(target_x)
            expect(new_pos.y).to eq(target_y)
          end
        end

        # TODO: - Create Window Manager guard
        not_compliant_on platform: :linux do
          it 'can maximize the current window' do
            window.size = old_size = Dimension.new(200, 200)

            window.maximize

            wait.until { window.size != old_size }

            new_size = window.size
            expect(new_size.width).to be > old_size.width
            expect(new_size.height).to be > old_size.height
          end
        end

        compliant_on browser: [:firefox, :edge] do
          # Firefox - https://bugzilla.mozilla.org/show_bug.cgi?id=1189749
          # Edge: Not Yet - https://dev.windows.com/en-us/microsoft-edge/platform/status/webdriver/details/
          not_compliant_on browser: [:firefox, :edge] do
            it 'can make window full screen' do
              window.maximize
              old_size = window.size

              window.full_screen

              new_size = window.size
              expect(new_size.height).to be > old_size.height
            end
          end
        end
      end
    end
  end # WebDriver
end # Selenium
