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

require 'concurrent'

module Selenium
  module WebDriver
    module DriverExtensions
      module HasNetworkInterception
        def intercept(patterns:, request: nil)
          return block_urls(patterns) if request.nil?

          patterns = update_parameters(patterns)
          request = process_request(request)

          atomic_number = Concurrent::AtomicFixnum.new

          devtools.fetch.enable(patterns: patterns)

          devtools.fetch.on(:request_paused) do |resp|
            @initial_id ||= resp["requestId"][/\d+/].to_i
            id = @initial_id + atomic_number.increment - 1
            request[:request_id] = "interception-job-#{id}.0"
            devtools.fetch.fulfill_request(request)
          end
        end

        private

        def block_urls(pattern)
          devtools.network.enable
          devtools.network.set_blocked_urls(urls: pattern[:url])
        end

        def update_parameters(patterns)
          patterns = Array[patterns]
          patterns.each do |pattern|
            pattern['urlPattern'] = pattern.delete(:url) if pattern.key?(:url)
            pattern['resourceType'] = pattern.delete(:type) if pattern.key?(:type)
            pattern['requestStage'] = pattern.delete(:stage) if pattern.key?(:stage)
          end
          patterns
        end

        def process_request(request)
          request ||= {}
          headers = request.delete(:headers) || {}
          headers[:name] = 'name'
          headers[:value] = 'value'
          request[:response_headers] = [headers]
          request[:response_code] ||= 200
          request
        end

      end # HasNetworkInterception
    end # DriverExtensions
  end # WebDriver
end # Selenium
