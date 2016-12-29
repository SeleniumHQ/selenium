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

module Selenium
  module WebDriver
    module Remote
      module Http
        class Common
          MAX_REDIRECTS   = 20 # same as chromium/gecko
          CONTENT_TYPE    = 'application/json'.freeze
          DEFAULT_HEADERS = {'Accept' => CONTENT_TYPE}.freeze

          attr_accessor :timeout
          attr_writer :server_url

          def initialize
            @timeout = nil
          end

          def quit_errors
            [IOError]
          end

          def close
            # hook for subclasses - will be called on Driver#quit
          end

          def call(verb, url, command_hash)
            url      = server_url.merge(url) unless url.is_a?(URI)
            headers  = DEFAULT_HEADERS.dup
            headers['Cache-Control'] = 'no-cache' if verb == :get

            if command_hash
              payload                   = JSON.generate(command_hash)
              headers['Content-Type']   = "#{CONTENT_TYPE}; charset=utf-8"
              headers['Content-Length'] = payload.bytesize.to_s if [:post, :put].include?(verb)

              if $DEBUG
                puts "   >>> #{url} | #{payload}"
                puts "     > #{headers.inspect}"
              end
            elsif verb == :post
              payload = '{}'
              headers['Content-Length'] = '2'
            end

            request verb, url, headers, payload
          end

          private

          def server_url
            return @server_url if @server_url
            raise Error::WebDriverError, 'server_url not set'
          end

          def request(*)
            raise NotImplementedError, 'subclass responsibility'
          end

          def create_response(code, body, content_type)
            code = code.to_i
            body = body.to_s.strip
            content_type = content_type.to_s
            puts "<- #{body}\n" if $DEBUG

            if content_type.include? CONTENT_TYPE
              raise Error::WebDriverError, "empty body: #{content_type.inspect} (#{code})\n#{body}" if body.empty?
              Response.new(code, JSON.parse(body))
            elsif code == 204
              Response.new(code)
            else
              msg = "unexpected response, code=#{code}, content-type=#{content_type.inspect}"
              msg << "\n#{body}" unless body.empty?

              raise Error::WebDriverError, msg
            end
          end
        end # Common
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
