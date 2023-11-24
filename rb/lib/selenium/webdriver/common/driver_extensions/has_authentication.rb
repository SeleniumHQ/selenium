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

module Selenium
  module WebDriver
    module DriverExtensions
      module HasAuthentication
        #
        # Registers basic authentication handler which is automatically
        # used whenever browser gets an authentication required response.
        # This currently relies on DevTools so is only supported in
        # Chromium browsers.
        #
        # @example Authenticate any request
        #   driver.register(username: 'admin', password: '123456')
        #
        # @example Authenticate based on URL
        #   driver.register(username: 'admin1', password: '123456', uri: /mysite1\.com/)
        #   driver.register(username: 'admin2', password: '123456', uri: /mysite2\.com/)
        #
        # @param [String] username
        # @param [String] password
        # @param [Regexp] uri to associate the credentials with
        #

        def register(username:, password:, uri: //)
          auth_handlers << {username: username, password: password, uri: uri}

          devtools.network.set_cache_disabled(cache_disabled: true)
          devtools.fetch.on(:auth_required) do |params|
            authenticate(params['requestId'], params.dig('request', 'url'))
          end
          devtools.fetch.on(:request_paused) do |params|
            devtools.fetch.continue_request(request_id: params['requestId'])
          end
          devtools.fetch.enable(handle_auth_requests: true)
        end

        private

        def auth_handlers
          @auth_handlers ||= []
        end

        def authenticate(request_id, url)
          credentials = auth_handlers.find do |handler|
            url.match?(handler[:uri])
          end

          if credentials
            devtools.fetch.continue_with_auth(
              request_id: request_id,
              auth_challenge_response: {
                response: 'ProvideCredentials',
                username: credentials[:username],
                password: credentials[:password]
              }
            )
          else
            devtools.fetch.continue_with_auth(
              request_id: request_id,
              auth_challenge_response: {
                response: 'CancelAuth'
              }
            )
          end
        end
      end # HasAuthentication
    end # DriverExtensions
  end # WebDriver
end # Selenium
