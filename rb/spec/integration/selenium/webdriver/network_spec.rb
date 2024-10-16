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
# "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require_relative 'spec_helper'
require_relative '../../../../lib/selenium/webdriver/common/network'

module Selenium
  module WebDriver
    describe Network, exclusive: {bidi: true, reason: 'only executed when bidi is enabled'},
                      only: {browser: %i[chrome edge firefox]} do
      let(:username) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.first }
      let(:password) { SpecSupport::RackServer::TestApp::BASIC_AUTH_CREDENTIALS.last }

      it 'adds an auth handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_auth_handler(username, password)
          expect(network.auth_callbacks.count).to be 1
        end
      end

      it 'removes an auth handler' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          id = network.add_auth_handler(username, password)
          network.remove_auth_handler(id)
          expect(network.auth_callbacks.count).to be 0
        end
      end

      it 'clears all auth handlers' do
        reset_driver!(web_socket_url: true) do |driver|
          network = described_class.new(driver)
          network.add_auth_handler(username, password)
          network.add_auth_handler(username, password)
          network.clear_auth_handlers
          expect(network.auth_callbacks.count).to be 0
        end
      end
    end
  end
end
