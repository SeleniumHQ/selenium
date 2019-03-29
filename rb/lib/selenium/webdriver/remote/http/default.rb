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

require 'net/https'
require 'ipaddr'

module Selenium
  module WebDriver
    module Remote
      module Http
        # @api private
        class Default < Common
          attr_writer :proxy

          attr_accessor :open_timeout
          attr_accessor :read_timeout

          # Initializes object.
          # Warning: Setting {#open_timeout} to non-nil values will cause a separate thread to spawn.
          # Debuggers that freeze the process will not be able to evaluate any operations if that happens.
          # @param [Numeric] open_timeout - Open timeout to apply to HTTP client.
          # @param [Numeric] read_timeout - Read timeout (seconds) to apply to HTTP client.
          def initialize(open_timeout: nil, read_timeout: nil)
            @open_timeout = open_timeout
            @read_timeout = read_timeout
          end

          # Maintaining backward compatibility.
          # @param [Numeric] value - Timeout in seconds to apply to both open timeout and read timeouts.
          # @deprecated Please set the specific desired timeout {#read_timeout} or {#open_timeout} directly.
          def timeout=(value)
            WebDriver.logger.deprecate ':timeout=', '#read_timeout= and #open_timeout='
            self.open_timeout = value
            self.read_timeout = value
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

              # Defaulting open_timeout to nil to be consistent with Ruby 2.2 and earlier.
              http.open_timeout = open_timeout
              http.read_timeout = read_timeout if read_timeout

              http.start
            end
          end

          MAX_RETRIES = 3

          def request(verb, url, headers, payload, redirects = 0)
            retries = 0

            begin
              request = new_request_for(verb, url, headers, payload)
              response = response_for(request)
            rescue Errno::ECONNABORTED, Errno::ECONNRESET, Errno::EADDRINUSE
              # a retry is sometimes needed on Windows XP where we may quickly
              # run out of ephemeral ports
              #
              # A more robust solution is bumping the MaxUserPort setting
              # as described here:
              #
              # http://msdn.microsoft.com/en-us/library/aa560610%28v=bts.20%29.aspx
              raise if retries >= MAX_RETRIES

              retries += 1
              sleep 2
              retry
            rescue Errno::EADDRNOTAVAIL => ex
              # a retry is sometimes needed when the port becomes temporarily unavailable
              raise if retries >= MAX_RETRIES

              retries += 1
              sleep 2
              retry
            rescue Errno::ECONNREFUSED => ex
              raise ex.class, "using proxy: #{proxy.http}" if use_proxy?

              raise
            end

            if response.is_a? Net::HTTPRedirection
              raise Error::WebDriverError, 'too many redirects' if redirects >= MAX_REDIRECTS

              request(:get, URI.parse(response['Location']), DEFAULT_HEADERS.dup, nil, redirects + 1)
            else
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
            if use_proxy?
              url = @proxy.http
              raise Error::WebDriverError, "expected HTTP proxy, got #{@proxy.inspect}" unless proxy.respond_to?(:http) && url

              proxy = URI.parse(url)

              clazz = Net::HTTP::Proxy(proxy.host, proxy.port, proxy.user, proxy.password)
              clazz.new(server_url.host, server_url.port)
            else
              Net::HTTP.new server_url.host, server_url.port
            end
          end

          def proxy
            @proxy ||= begin
              proxy = ENV['http_proxy'] || ENV['HTTP_PROXY']
              no_proxy = ENV['no_proxy'] || ENV['NO_PROXY']

              if proxy
                proxy = "http://#{proxy}" unless proxy.start_with?('http://')
                Proxy.new(http: proxy, no_proxy: no_proxy)
              end
            end
          end

          def use_proxy?
            return false if proxy.nil?

            if proxy.no_proxy
              ignored = proxy.no_proxy.split(',').any? do |host|
                host == '*' ||
                  host == server_url.host || (
                begin
                  IPAddr.new(host).include?(server_url.host)
                rescue ArgumentError
                  false
                end
              )
              end

              !ignored
            else
              true
            end
          end
        end # Default
      end # Http
    end # Remote
  end # WebDriver
end # Selenium
