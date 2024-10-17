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

require_relative '../spec_helper'

module Selenium
  module WebDriver
    class BiDi
      describe BrowsingContext, exclusive: { bidi: true, reason: 'only executed when bidi is enabled' },
               only: { browser: %i[chrome edge firefox] } do
        after { |example| reset_driver!(example: example) }
        let(:bridge) { driver.instance_variable_get(:@bridge) }

        describe '#create' do
          it 'without arguments' do
            id = described_class.new(bridge).create

            expect(driver.window_handles).to include(id)
          end

          it 'accepts a tab type' do
            id = described_class.new(bridge).create(type: :tab)

            expect(driver.window_handles).to include(id)
          end

          it 'accepts a window type' do
            id = described_class.new(bridge).create(type: :window)

            expect(driver.window_handles).to include(id)
          end

          it 'errors on unknown type' do
            msg = /invalid argument: Invalid enum value. Expected 'tab' | 'window', received 'unknown'/
            expect {
              described_class.new(bridge).create(type: :unknown)
            }.to raise_error(Error::WebDriverError, msg)
          end

          it 'accepts a reference context' do
            id = driver.window_handle
            result = described_class.new(bridge).create(context_id: id)

            expect(driver.window_handles).to include(id, result)
          end
        end

        it 'closes a window' do
          browsing_context = described_class.new(bridge)
          window1 = browsing_context.create
          window2 = browsing_context.create

          browsing_context.close(context_id: window2)

          handles = driver.window_handles
          expect(handles).to include(window1)
          expect(handles).not_to include(window2)
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
