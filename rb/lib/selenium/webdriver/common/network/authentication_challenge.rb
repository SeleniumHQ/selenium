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

        # @api private
        def initialize(data)
          @data = data
          @answer = nil
        end

        # @return [String] the id the browser gave the request
        def id
          @data.request.request
        end

        # @return [String] the URL of the request that was challenged
        def url
          @data.request.url
        end

        # Answers the challenge with these credentials.
        # @param username [String]
        # @param password [String]
        def authenticate(username:, password:)
          credentials = BiDi::Protocol::Network::AuthCredentials.new(username: username, password: password)
          answer_with(action: :provide_credentials, credentials: credentials)
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
