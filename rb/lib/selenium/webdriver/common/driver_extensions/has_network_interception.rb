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
      module HasNetworkInterception

        #
        # Intercepts requests coming from browser allowing
        # to either pass them through like proxy or provide
        # a stubbed response instead.
        #
        # @example Log requests and pass through
        #   driver.intercept do |request|
        #     puts "#{request.method} #{request.url}"
        #     request.continue
        #   end
        #
        # @example Stub requests for images
        #   driver.intercept do |request|
        #     if request.url.match?(/\.png$/)
        #       request.respond(body: File.read('myfile.png'))
        #     else
        #       request.continue
        #     end
        #   end
        #
        # @example Log responses and pass through
        #   driver.intercept do |request|
        #     request.continue do |response|
        #       puts "#{response.code} #{response.body}"
        #       response.continue
        #     end
        #   end
        #
        # @example Mutate specific response
        #   driver.intercept do |request|
        #     request.continue do |response|
        #       if request.url.include?('/myurl')
        #         request.respond(body: "#{response.body}, Added by Selenium!")
        #       else
        #         response.continue
        #       end
        #     end
        #   end
        #
        # @param [#call] block which is called when request is interecepted
        # @yieldparam [DevTools::Request]
        #

        def intercept(&block)
          devtools.network.set_cache_disabled(cache_disabled: true)
          devtools.fetch.on(:request_paused) do |params|
            id = params['requestId']
            if params.key?('responseStatusCode') || params.key?('responseErrorReason')
              intercept_response(id, params, &intercepted_requests[id].on_response)
            else
              intercept_request(id, params, &block)
            end
          end
          devtools.fetch.enable(patterns: [{requestStage: 'Request'}, {requestStage: 'Response'}])
        end

        private

        def intercepted_requests
          @intercepted_requests ||= {}
        end

        def intercept_request(id, params)
          request = DevTools::Request.new(
            devtools: devtools,
            id: id,
            url: params.dig('request', 'url'),
            method: params.dig('request', 'method'),
            headers: params.dig('request', 'headers')
          )
          intercepted_requests[id] = request

          yield request
        end

        def intercept_response(id, params)
          response = DevTools::Response.new(
            devtools: devtools,
            id: id,
            code: params['responseStatusCode'],
            headers: params['responseHeaders']
          )
          intercepted_requests.delete(id)

          yield response
        end
      end # HasNetworkInterception
    end # DriverExtensions
  end # WebDriver
end # Selenium
