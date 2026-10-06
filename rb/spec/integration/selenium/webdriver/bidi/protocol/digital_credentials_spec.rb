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

require_relative '../../spec_helper'
require 'selenium/webdriver/bidi/protocol'

module Selenium
  module WebDriver
    class BiDi
      module Protocol
        describe DigitalCredentials, skip_unless: {bidi: true, reason: 'only executed when bidi is enabled'} do
          after { |example| reset_driver!(example: example) }

          let(:digital_credentials) { described_class.new(driver) }

          describe '#set_virtual_wallet_behavior',
                   pending_if: {browser: :firefox,
                                exception: {class: Error::UnknownCommandError},
                                reason: 'Firefox returns unknown command for setVirtualWalletBehavior'} do
            it 'sets and clears the virtual wallet behavior' do
              driver.navigate.to url_for('blank.html')

              expect(digital_credentials.set_virtual_wallet_behavior(
                       action: :decline,
                       context: driver.window_handle
                     )).to be_empty
              expect(digital_credentials.set_virtual_wallet_behavior(
                       action: :clear,
                       context: driver.window_handle
                     )).to be_empty
            end
          end
        end
      end # Protocol
    end # BiDi
  end # WebDriver
end # Selenium
