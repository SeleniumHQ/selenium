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
require 'uri/generic'

module Selenium
  module WebDriver
    module Remote
      module Http
        # @api private
        class Default < Common
          attr_writer :proxy

          attr_accessor :open_timeout, :read_timeout

          # Initializes object.
          # Warning: Setting {#open_timeout} to non-nil values will cause a separate thread to spawn.
          # Debuggers that freeze the process will not be able to evaluate any operations if that happens.
          # @param [Numeric] open_timeout - Open timeout to apply to HTTP client.
          # @param [Numeric] read_timeout - Read timeout (seconds) to apply to HTTP client.
          def initialize(open_timeout: nil, read_timeout: nil)
            @open_timeout = open_timeout
            @read_timeout = read_timeout
            super()
          end

          def close
            @http&.finish
          end

          private

          def http
            @http ||= begin
              http = new_http_client
              if server_url.scheme == 'https'
                http.use_ssl = true
                http.verify_mode = OpenSSL::SSL::VERIFY_NONE
              end

              http.open_timeout = open_timeout if open_timeout
              http.read_timeout = read_timeout if read_timeout

              start(http)
              http
            end
          end

          def start(http)
            http.start
          end

          MAX_RETRIES = 3

          def request(verb, url, headers, payload, redirects = 0)
            retries = 0

            begin
              request = new_request_for(verb, url, headers, payload)
              response = response_for(request)
            rescue Errno::ECONNABORTED, Errno::ECONNRESET, Errno::EADDRINUSE, Errno::EADDRNOTAVAIL
              # a retry is sometimes needed:
              #   on Windows XP where we may quickly run out of ephemeral ports
              #   when the port becomes temporarily unavailable
              #
              # A more robust solution is bumping the MaxUserPort setting
              # as described here:
              #
              # http://msdn.microsoft.com/en-us/library/aa560610%28v=bts.20%29.aspx
              raise if retries >= MAX_RETRIES

              retries += 1
              sleep 2
              retry
            rescue Errno::ECONNREFUSED => e
              raise e.class, "using proxy: #{http.proxy_uri}" if http.proxy?

              raise
            end

            if response.is_a? Net::HTTPRedirection
              WebDriver.logger.debug("Redirect to #{response['Location']}; times: #{redirects}")
              raise Error::WebDriverError, 'too many redirects' if redirects >= MAX_REDIRECTS

              request(:get, URI.parse(response['Location']), DEFAULT_HEADERS.dup, nil, redirects + 1)
            else
              WebDriver.logger.debug("   <<<  #{response.instance_variable_get(:@header).inspect}", id: :header)
              create_response response.code, response.body, response.content_type
            end
          end

          def new_request_for(verb, url, headers, payload)
            req = Net::HTTP.const_get(verb.to_s.capitalize).new(url.path, headers)

            req.basic_auth server_url.user, server_url.password if server_url.userinfo

            req.body = payload if payload

            req
          end

          def response_for(request)
            http.request request
          end

          def new_http_client
            if proxy
              url = proxy.http
              unless proxy.respond_to?(:http) && url
                raise Error::WebDriverError,
                      "expected HTTP proxy, got #{proxy.inspect}"
              end

              proxy_url = URI.parse(url)

              Net::HTTP.new(server_url.host, server_url.port,
                            proxy_url.host, proxy_url.port, proxy_url.user, proxy_url.password,
                            proxy.no_proxy&.join(','))
            else
              Net::HTTP.new(server_url.host, server_url.port, nil)
            end
          end

          def proxy
            @proxy ||= begin
              proxy = ENV.fetch('http_proxy', nil) || ENV.fetch('HTTP_PROXY', nil)
              no_proxy = ENV.fetch('no_proxy', nil) || ENV.fetch('NO_PROXY', nil)

              if proxy
                proxy = "http://#{proxy}" unless proxy.start_with?('http://')
                Proxy.new(http: proxy, no_proxy: no_proxy)
              end
            end
          end
        end # Default
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
