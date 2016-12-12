# encoding: utf-8
#
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

require 'curb'

module Selenium
  module WebDriver
    module Remote

      module Http
        #
        # An alternative to the default Net::HTTP client.
        #
        # This can be used for the Firefox and Remote drivers if you have Curb
        # installed.
        #
        # @example Using Curb
        #   require 'selenium/webdriver/remote/http/curb'
        #   include Selenium
        #
        #   driver = WebDriver.for :firefox, :http_client => WebDriver::Remote::Http::Curb.new
        #

        class Curb < Common

          def quit_errors
            [Curl::Err::RecvError] + super
          end

          private

          def request(verb, url, headers, payload)
            client.url = url.to_s

            # workaround for http://github.com/taf2/curb/issues/issue/40
            # curb will handle this for us anyway
            headers.delete 'Content-Length'

            client.headers = headers

            # http://github.com/taf2/curb/issues/issue/33
            client.head   = false
            client.delete = false

            case verb
            when :get
              client.http_get
            when :post
              client.post_body = payload || ''
              client.http_post
            when :put
              client.put_data = payload || ''
              client.http_put
            when :delete
              client.http_delete
            when :head
              client.http_head
            else
              raise Error::WebDriverError, "unknown HTTP verb: #{verb.inspect}"
            end

            create_response client.response_code, client.body_str, client.content_type
          end

          def client
            @client ||= (
              c = Curl::Easy.new

              c.max_redirects   = MAX_REDIRECTS
              c.follow_location = true
              c.timeout         = @timeout if @timeout
              c.verbose         = $DEBUG

              c
            )
          end
        end # Curb
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
