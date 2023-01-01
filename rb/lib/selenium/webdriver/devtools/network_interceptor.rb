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
      #
      # Wraps the network request/response interception, providing
      # thread-safety guarantees and handling special cases such as browser
      # canceling requests midst interception.
      #
      # You should not be using this class directly, use Driver#intercept instead.
      # @api private
      #

      class NetworkInterceptor
        # CDP fails to get body on certain responses (301) and raises:
        # "Can only get response body on requests captured after headers received."
        CANNOT_GET_BODY_ON_REDIRECT_ERROR_CODE = '-32000'

        # CDP fails to operate with intercepted requests.
        # Typical reason is browser cancelling intercepted requests/responses.
        INVALID_INTERCEPTION_ID_ERROR_CODE = '-32602'

        def initialize(devtools)
          @devtools = devtools
          @lock = Mutex.new
        end

        def intercept(&block)
          devtools.network.on(:loading_failed) { |params| track_cancelled_request(params) }
          devtools.fetch.on(:request_paused) { |params| request_paused(params, &block) }

          devtools.network.set_cache_disabled(cache_disabled: true)
          devtools.network.enable
          devtools.fetch.enable(patterns: [{requestStage: 'Request'}, {requestStage: 'Response'}])
        end

        private

        attr_accessor :devtools, :lock

        # We should be thread-safe to use the hash without synchronization
        # because its keys are interception job identifiers and they should be
        # unique within a devtools session.
        def pending_response_requests
          @pending_response_requests ||= {}
        end

        # Ensure usage of cancelled_requests is thread-safe via synchronization!
        def cancelled_requests
          @cancelled_requests ||= []
        end

        def track_cancelled_request(data)
          return unless data['canceled']

          lock.synchronize { cancelled_requests << data['requestId'] }
        end

        def request_paused(data, &block)
          id = data['requestId']
          network_id = data['networkId']

          with_cancellable_request(network_id) do
            if response?(data)
              block = pending_response_requests.delete(id)
              intercept_response(id, data, &block)
            else
              intercept_request(id, data, &block)
            end
          end
        end

        # The presence of any of these fields indicate we're at the response stage.
        # @see https://chromedevtools.github.io/devtools-protocol/tot/Fetch/#event-requestPaused
        def response?(params)
          params.key?('responseStatusCode') || params.key?('responseErrorReason')
        end

        def intercept_request(id, params, &block)
          original = DevTools::Request.from(id, params)
          mutable = DevTools::Request.from(id, params)

          block.call(mutable) do |&continue| # rubocop:disable Performance/RedundantBlockCall
            pending_response_requests[id] = continue

            if original == mutable
              continue_request(original.id)
            else
              mutate_request(mutable)
            end
          end
        end

        def intercept_response(id, params)
          return continue_response(id) unless block_given?

          body = fetch_response_body(id)
          original = DevTools::Response.from(id, body, params)
          mutable = DevTools::Response.from(id, body, params)
          yield mutable

          if original == mutable
            continue_response(id)
          else
            mutate_response(mutable)
          end
        end

        def continue_request(id)
          devtools.fetch.continue_request(request_id: id)
        end
        alias continue_response continue_request

        def mutate_request(request)
          devtools.fetch.continue_request(
            request_id: request.id,
            url: request.url,
            method: request.method,
            post_data: request.post_data,
            headers: request.headers.map do |k, v|
              {name: k, value: v}
            end
          )
        end

        def mutate_response(response)
          devtools.fetch.fulfill_request(
            request_id: response.id,
            body: (Base64.strict_encode64(response.body) if response.body),
            response_code: response.code,
            response_headers: response.headers.map do |k, v|
              {name: k, value: v}
            end
          )
        end

        def fetch_response_body(id)
          devtools.fetch.get_response_body(request_id: id).dig('result', 'body')
        rescue Error::WebDriverError => e
          raise unless e.message.start_with?(CANNOT_GET_BODY_ON_REDIRECT_ERROR_CODE)
        end

        def with_cancellable_request(network_id)
          yield
        rescue Error::WebDriverError => e
          raise if e.message.start_with?(INVALID_INTERCEPTION_ID_ERROR_CODE) && !cancelled?(network_id)
        end

        def cancelled?(network_id)
          lock.synchronize { !!cancelled_requests.delete(network_id) }
        end
      end # NetworkInterceptor
    end # DevTools
  end # WebDriver
end # Selenium
