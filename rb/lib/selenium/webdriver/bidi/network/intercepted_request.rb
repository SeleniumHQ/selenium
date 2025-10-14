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

require_relative 'cookies'
require_relative 'headers'

module Selenium
  module WebDriver
    class BiDi
      class InterceptedRequest < InterceptedItem
        attr_accessor :method, :url
        attr_reader :body

        def initialize(network, request)
          super
          @method = nil
          @url = nil
          @body = nil
        end

        def continue
          network.continue_request(
            id: id,
            body: body,
            cookies: cookies.as_json,
            headers: headers.as_json,
            method: method,
            url: url
          )
        end

        def fail
          network.fail_request(id)
        end

        def body=(value)
          @body = {
            type: 'string',
            value: value.to_json
          }
        end

        def headers
          @headers ||= Headers.new
        end

        def cookies(cookies = {})
          @cookies ||= Cookies.new(cookies)
        end
      end
    end # BiDi
  end # WebDriver
end # Selenium
