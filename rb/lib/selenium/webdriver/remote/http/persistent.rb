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

require 'net/http/persistent'

module Selenium
  module WebDriver
    module Remote
      module Http
        # @api private
        class Persistent < Default
          def close
            @http&.shutdown
          end

          private

          def new_http_client
            proxy = nil

            if @proxy
              unless @proxy.respond_to?(:http)
                url = @proxy.http
                raise Error::WebDriverError, "expected HTTP proxy, got #{@proxy.inspect}" unless url
              end
              proxy = URI.parse(url)
            end

            if Net::HTTP::Persistent::VERSION >= '3'
              Net::HTTP::Persistent.new name: 'webdriver', proxy: proxy
            else
              WebDriver.logger.warn 'Support for this version of net-http-persistent is deprecated. Please upgrade.'
              Net::HTTP::Persistent.new 'webdriver', proxy
            end
          end

          def response_for(request)
            http.request server_url, request
          end
        end # Persistent
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
