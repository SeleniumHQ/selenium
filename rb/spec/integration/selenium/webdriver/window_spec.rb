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
    describe Window do
      after do
        sleep 1 if ENV['TRAVIS']
        quit_driver
      end

      let(:window) { driver.manage.window }

      it 'gets the size of the current window' do
        size = window.size

        expect(size).to be_a(Dimension)

        expect(size.width).to be_positive
        expect(size.height).to be_positive
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

      it 'gets the position of the current window' do
        pos = window.position

        expect(pos).to be_a(Point)

        expect(pos.x).to be >= 0
        expect(pos.y).to be >= 0
      end

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

      it 'gets the rect of the current window' do
        rect = window.rect

        expect(rect).to be_a(Rectangle)

        expect(rect.x).to be >= 0
        expect(rect.y).to be >= 0
        expect(rect.width).to be >= 0
        expect(rect.height).to be >= 0
      end

      it 'sets the rect of the current window' do
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

      it 'can maximize the current window', except: {window_manager: false, browser: %i[ie firefox safari]} do
        window.size = old_size = Dimension.new(700, 700)

        window.maximize
        wait.until { window.size != old_size }

        new_size = window.size
        expect(new_size.width).to be > old_size.width
        expect(new_size.height).to be > old_size.height
      end

      # Edge: Not Yet - https://dev.windows.com/en-us/microsoft-edge/platform/status/webdriver/details/
      # https://github.com/mozilla/geckodriver/issues/1281
      it 'can make window full screen', only: {window_manager: true},
                                        exclude: [{driver: :remote, browser: :firefox, platform: :linux},
                                                  {driver: :remote, browser: :safari},
                                                  {browser: %i[chrome edge]}] do
        window.size = old_size = Dimension.new(700, 700)

        window.full_screen
        wait.until { window.size != old_size }

        new_size = window.size
        expect(new_size.width).to be > old_size.width
        expect(new_size.height).to be > old_size.height
      end

      # Edge: Not Yet - https://dev.windows.com/en-us/microsoft-edge/platform/status/webdriver/details/
      # https://github.com/mozilla/geckodriver/issues/1281
      it 'can minimize the window', only: {window_manager: true},
                                    exclude: [{driver: :remote, browser: :firefox, platform: :linux},
                                              {driver: :remote, browser: :safari}] do
        window.minimize
        expect(driver.execute_script('return document.hidden;')).to be true
      end
    end
  end # WebDriver
end # Selenium
