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
    describe Network,
             only: {browser: %i[chrome edge firefox]} do

      it 'adds auth handler' do
        reset_driver!(web_socket_url: true) do |driver|
          driver.network.add_auth_handler(username: 'user', password: 'pass')
        end
      end

      it 'errors when missing required args' do
        reset_driver!(web_socket_url: true) do |driver|
          msg = /Missing required arguments: response, username, password/
          expect { driver.network.add_auth_handler }.to raise_error(ArgumentError, msg)
        end
      end

      it 'errors when invalid args' do
        reset_driver!(web_socket_url: true) do |driver|
          msg = /Invalid arguments: invalid, args/
          expect { driver.network.add_auth_handler(invalid: 'args') }.to raise_error(ArgumentError, msg)
        end
      end
    end
  end
end
