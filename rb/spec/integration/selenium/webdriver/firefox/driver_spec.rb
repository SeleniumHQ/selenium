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
    describe Firefox, only: {browser: %i[firefox]} do
      it 'creates default capabilities' do
        create_driver! do |driver|
          caps = driver.capabilities
          expect(caps.proxy).to be_nil
          expect(caps.browser_version).to match(/^\d\d\./)
          expect(caps.platform_name).not_to be_nil

          expect(caps.accept_insecure_certs).to be == false
          expect(caps.page_load_strategy).to be == 'normal'
          expect(caps.implicit_timeout).to be_zero
          expect(caps.page_load_timeout).to be == 300000
          expect(caps.script_timeout).to be == 30000
        end
      end

      it 'has remote session ID', only: {driver: :remote} do
        create_driver! do |driver|
          expect(driver.capabilities.remote_session_id).to be_truthy
        end
      end
    end
  end # WebDriver
end # Selenium
