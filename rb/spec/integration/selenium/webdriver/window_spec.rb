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

      # WIP: Linux flaky guard removed to check whether #17644 (X server before
      # fluxbox) fixed the underlying minimize flakiness on Linux CI.
      describe '#minimize experiment' do
        # Restore to a known visible state before each attempt so every iteration
        # is a real minimize-from-visible, not a no-op on an already-minimized window.
        before { window.rect = Rectangle.new(50, 50, 600, 500) }

        20.times do |i|
          it "minimizes the window (run #{i + 1})" do
            window.minimize
            expect {
              wait.until { driver.execute_script('return document.hidden;') }
            }.not_to raise_error
          end
        end
      end
    end
  end # WebDriver
end # Selenium
