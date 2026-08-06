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

require 'uri'

module Selenium
  module WebDriver
    #
    # Configuration for HTTP clients.
    #

    class ClientConfig
      class << self
        attr_accessor :default_extra_headers
        attr_writer :default_user_agent

        def default_user_agent
          @default_user_agent ||= "selenium/#{WebDriver::VERSION} (ruby #{Platform.os})"
        end
      end

      attr_accessor :open_timeout, :read_timeout, :max_redirects, :proxy
      attr_writer :extra_headers, :user_agent
      attr_reader :server_url

      #
      # @param [Numeric] open_timeout Seconds to wait for the connection to open.
      # @param [Numeric] read_timeout Seconds to wait for a response.
      # @param [Integer] max_redirects Maximum number of redirects to follow.
      # @param [Proxy] proxy Proxy to use for the connection.
      # @param [Hash] extra_headers Additional headers to send with each request.
      # @param [String] user_agent Value to send as the User-Agent header.
      # @param [String, URI] server_url URL of the server to connect to.
      #
      def initialize(open_timeout: 60,
                     read_timeout: 120,
                     max_redirects: 20,
                     proxy: nil,
                     extra_headers: nil,
                     user_agent: nil,
                     server_url: nil)
        @open_timeout = open_timeout
        @read_timeout = read_timeout
        @max_redirects = max_redirects
        @proxy = proxy || proxy_from_environment
        @extra_headers = extra_headers
        @user_agent = user_agent
        self.server_url = server_url
      end

      def user_agent
        @user_agent || self.class.default_user_agent
      end

      def extra_headers
        @extra_headers || self.class.default_extra_headers
      end

      def server_url=(url)
        if url.nil?
          @server_url = nil
        else
          url = url.to_s
          url += '/' unless url.end_with?('/')
          @server_url = URI.parse(url)
        end
      end

      private

      def proxy_from_environment
        proxy = ENV.fetch('http_proxy', nil) || ENV.fetch('HTTP_PROXY', nil)
        return unless proxy

        no_proxy = ENV.fetch('no_proxy', nil) || ENV.fetch('NO_PROXY', nil)
        proxy = "http://#{proxy}" unless proxy.match?(%r{\Ahttps?://})
        Proxy.new(http: proxy, no_proxy: no_proxy)
      end
    end
  end
end
