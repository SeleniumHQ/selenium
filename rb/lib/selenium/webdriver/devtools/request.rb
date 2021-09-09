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
    class DevTools
      class Request

        attr_reader :url, :method, :headers

        # @api private
        attr_reader :on_response

        def initialize(devtools:, id:, url:, method:, headers:)
          @devtools = devtools
          @id = id
          @url = url
          @method = method
          @headers = headers
          @on_response = Proc.new(&:continue)
        end

        #
        # Continues the request, optionally yielding
        # the response before it reaches the browser.
        #
        # @param [#call] block which is called when response is intercepted
        # @yieldparam [DevTools::Response]
        #

        def continue(&block)
          @on_response = block if block_given?
          @devtools.fetch.continue_request(request_id: @id)
        end

        #
        # Fulfills the request providing the stubbed response.
        #
        # @param [Integer] code
        # @param [Hash] headers
        # @param [String] body
        #

        def respond(code: 200, headers: {}, body: '')
          @devtools.fetch.fulfill_request(
            request_id: @id,
            body: Base64.strict_encode64(body),
            response_code: code,
            response_headers: headers.map do |k, v|
              {name: k, value: v}
            end
          )
        end

        def inspect
          %(#<#{self.class.name} @method="#{method}" @url="#{url}")
        end

      end # Request
    end # DevTools
  end # WebDriver
end # Selenium
