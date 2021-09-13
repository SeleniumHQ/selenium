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
        #   driver.intercept do |request, &continue|
        #     puts "#{request.method} #{request.url}"
        #     continue.call(request)
        #   end
        #
        # @example Stub requests for images
        #   driver.intercept do |request, &continue|
        #     if request.url.match?(/\.png$/)
        #       request.url = 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Selenium_Logo.png'
        #     end
        #     continue.call(request)
        #   end
        #
        # @example Log responses and pass through
        #   driver.intercept do |request, &continue|
        #     continue.call(request) do |response|
        #       puts "#{response.code} #{response.body}"
        #     end
        #   end
        #
        # @example Mutate specific response
        #   driver.intercept do |request, &continue|
        #     continue.call(request) do |response|
        #       response.body << 'Added by Selenium!' if request.url.include?('/myurl')
        #     end
        #   end
        #
        # @param [Proc] block which is called when request is intercepted
        # @yieldparam [DevTools::Request] request
        # @yieldparam [Proc] continue block which proceeds with the request and optionally yields response
        #

        def intercept(&block)
          devtools.network.set_cache_disabled(cache_disabled: true)
          devtools.fetch.on(:request_paused) do |params|
            id = params['requestId']
            if params.key?('responseStatusCode') || params.key?('responseErrorReason')
              intercept_response(id, params, &pending_response_requests.delete(id))
            else
              intercept_request(id, params, &block)
            end
          end
          devtools.fetch.enable(patterns: [{requestStage: 'Request'}, {requestStage: 'Response'}])
        end

        private

        def pending_response_requests
          @pending_response_requests ||= {}
        end

        def intercept_request(id, params, &block)
          original = DevTools::Request.from(id, params)
          mutable = DevTools::Request.from(id, params)

          block.call(mutable) do |&continue| # rubocop:disable Performance/RedundantBlockCall
            pending_response_requests[id] = continue

            if original == mutable
              devtools.fetch.continue_request(request_id: id)
            else
              devtools.fetch.continue_request(
                request_id: id,
                url: mutable.url,
                method: mutable.method,
                post_data: mutable.post_data,
                headers: mutable.headers.map do |k, v|
                  {name: k, value: v}
                end
              )
            end
          end
        end

        def intercept_response(id, params)
          return devtools.fetch.continue_request(request_id: id) unless block_given?

          body = fetch_response_body(id)
          original = DevTools::Response.from(id, body, params)
          mutable = DevTools::Response.from(id, body, params)
          yield mutable

          if original == mutable
            devtools.fetch.continue_request(request_id: id)
          else
            devtools.fetch.fulfill_request(
              request_id: id,
              body: (Base64.strict_encode64(mutable.body) if mutable.body),
              response_code: mutable.code,
              response_headers: mutable.headers.map do |k, v|
                {name: k, value: v}
              end
            )
          end
        end

        def fetch_response_body(id)
          devtools.fetch.get_response_body(request_id: id).dig('result', 'body')
        rescue Error::WebDriverError
          # CDP fails to get body on certain responses (301) and raises:
          # Can only get response body on requests captured after headers received.
        end
      end # HasNetworkInterception
    end # DriverExtensions
  end # WebDriver
end # Selenium
