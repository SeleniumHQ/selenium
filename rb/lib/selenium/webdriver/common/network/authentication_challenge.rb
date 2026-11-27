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
    class Network
      #
      # The authentication challenge an authentication handler is given. The first handler to answer it ends the
      # chain; a challenge no handler answers is left to the browser.
      #

      class AuthenticationChallenge
        # @api private
        # @return [Hash, nil] the continueWithAuth arguments a handler answered with, or nil while none has
        attr_reader :answer

        # The event as the browser sent it, with everything it carries, such as the realm in
        # params.response.auth_challenges. Its fields follow the WebDriver BiDi spec, not the deprecation policy.
        # @return [BiDi::Protocol::Network::AuthRequiredParameters]
        # @see https://www.selenium.dev/documentation/warnings/bidi-implementation/
        attr_reader :params

        # @api private
        def initialize(params)
          @params = params
          @answer = nil
        end

        # @return [String] the id the browser gave the request
        def id
          params.request.request
        end

        # @return [String] the URL of the request that was challenged
        def url
          params.request.url
        end

        # Answers the challenge with these credentials.
        # @param username [String]
        # @param password [String]
        def authenticate(*positional, **credentials)
          unless positional.empty?
            WebDriver.logger.deprecate('AuthenticationChallenge#authenticate with a positional username and password',
                                       '#authenticate(username:, password:)',
                                       id: :network_auth_authenticate, reference: REFERENCE)
            credentials = {username: positional[0], password: positional[1]}
          end
          credentials = BiDi::Protocol::Network::AuthCredentials.new(username: credentials.fetch(:username),
                                                                     password: credentials.fetch(:password))
          answer_with(action: :provide_credentials, credentials: credentials)
        end

        # @deprecated Return without answering, which leaves the challenge to the next handler and then the browser.
        def skip
          WebDriver.logger.deprecate('AuthenticationChallenge#skip', 'returning without answering',
                                     id: :network_auth_skip, reference: REFERENCE)
          answer_with(action: :default)
        end

        # Answers the challenge with none, so the request ends with the response that challenged it.
        def cancel
          answer_with(action: :cancel)
        end

        private

        def answer_with(**answer)
          raise Error::WebDriverError, 'the challenge was already answered; a handler answers it once' if @answer

          @answer = answer
          nil
        end
      end # AuthenticationChallenge
    end # Network
  end # WebDriver
end # Selenium
