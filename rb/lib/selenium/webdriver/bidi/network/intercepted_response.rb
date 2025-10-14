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

require_relative 'credentials'
require_relative 'headers'
require_relative 'cookies'

module Selenium
  module WebDriver
    class BiDi
      class InterceptedResponse < InterceptedItem
        attr_accessor :reason, :status
        attr_reader :body

        def initialize(network, request)
          super
          @reason = nil
          @status = nil
          @body = nil
        end

        def continue
          network.continue_response(
            id: id,
            cookies: cookies.as_json,
            headers: headers.as_json,
            credentials: credentials.as_json,
            reason: reason,
            status: status
          )
        end

        def provide_response
          network.provide_response(
            id: id,
            cookies: cookies.as_json,
            headers: headers.as_json,
            body: body,
            reason: reason,
            status: status
          )
        end

        def credentials(username: nil, password: nil)
          @credentials ||= Credentials.new(username: username, password: password)
        end

        def headers
          @headers ||= Headers.new
        end

        def cookies(cookies = {})
          @cookies ||= Cookies.new(cookies)
        end

        def body=(value)
          @body = {
            type: 'string',
            value: value.to_json
          }
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
