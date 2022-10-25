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

        attr_accessor :url, :method, :headers, :post_data
        attr_reader :id

        #
        # Creates request from DevTools message.
        # @api private
        #

        def self.from(id, params)
          new(
            id: id,
            url: params.dig('request', 'url'),
            method: params.dig('request', 'method'),
            headers: params.dig('request', 'headers').dup,
            post_data: params.dig('request', 'postData')
          )
        end

        def initialize(id:, url:, method:, headers:, post_data:)
          @id = id
          @url = url
          @method = method
          @headers = headers
          @post_data = post_data
        end

        def ==(other)
          self.class == other.class &&
            id == other.id &&
            url == other.url &&
            method == other.method &&
            headers == other.headers &&
            post_data == other.post_data
        end

        def inspect
          %(#<#{self.class.name} @id="#{id}" @method="#{method}" @url="#{url}")
        end

      end # Request
    end # DevTools
  end # WebDriver
end # Selenium
