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
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe Browser, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:browser) { described_class.new(driver) }

          it 'creates a user context',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            user_context = browser.create_user_context

            expect(user_context.user_context).to be_a String
          end

          it 'gets user contexts',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            created = browser.create_user_context.user_context
            all_ids = browser.get_user_contexts.user_contexts.map(&:user_context)

            expect(all_ids).to include(created)
          end

          it 'removes a user context',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            to_remove = browser.create_user_context.user_context
            browser.remove_user_context(user_context: to_remove)
            remaining = browser.get_user_contexts.user_contexts.map(&:user_context)

            expect(remaining).not_to include(to_remove)
          end

          it 'throws an error when removing the default user context',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            expect {
              browser.remove_user_context(user_context: 'default')
            }.to raise_error(Error::WebDriverError, /user context cannot be removed/)
          end

          it 'throws an error when removing a non-existent user context',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            expect {
              browser.remove_user_context(user_context: 'fake_context')
            }.to raise_error(Error::WebDriverError)
          end

          it 'gets client windows',
             pending_if: {browser_family: :safari,
                          reason: 'Safari does not support BiDi user contexts or getClientWindows'} do
            windows = browser.get_client_windows.client_windows

            expect(windows.first).to be_a(Browser::ClientWindowInfo)
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
