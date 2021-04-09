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
    class Manager
      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Add a cookie to the browser
      #
      # @param [Hash] opts the options to create a cookie with.
      # @option opts [String] :name A name
      # @option opts [String] :value A value
      # @option opts [String] :path ('/') A path
      # @option opts [String] :secure (false) A boolean
      # @option opts [String] :same_site (Strict or Lax) currently supported only in chrome 80+ versions
      # @option opts [Time,DateTime,Numeric,nil] :expires (nil) Expiry date, either as a Time, DateTime, or seconds since epoch.
      #
      # @raise [ArgumentError] if :name or :value is not specified
      #

      def add_cookie(opts = {})
        raise ArgumentError, 'name is required' unless opts[:name]
        raise ArgumentError, 'value is required' unless opts[:value]

        # NOTE: This is required because of https://bugs.chromium.org/p/chromedriver/issues/detail?id=3732
        opts[:secure] ||= false

        same_site = opts.delete(:same_site)
        opts[:sameSite] = same_site if same_site

        http_only = opts.delete(:http_only)
        opts[:httpOnly] = http_only if http_only

        obj = opts.delete(:expires)
        opts[:expiry] = seconds_from(obj).to_i if obj

        @bridge.add_cookie opts
      end

      #
      # Get the cookie with the given name
      #
      # @param [String] name the name of the cookie
      # @return [Hash, nil] the cookie, or nil if it wasn't found.
      #

      def cookie_named(name)
        convert_cookie(@bridge.cookie(name))
      end

      #
      # Delete the cookie with the given name
      #
      # @param [String] name the name of the cookie to delete
      #

      def delete_cookie(name)
        @bridge.delete_cookie name
      end

      #
      # Delete all cookies
      #

      def delete_all_cookies
        @bridge.delete_all_cookies
      end

      #
      # Get all cookies
      #
      # @return [Array<Hash>] list of cookies
      #

      def all_cookies
        @bridge.cookies.map { |cookie| convert_cookie(cookie) }
      end

      def timeouts
        @timeouts ||= Timeouts.new(@bridge)
      end

      #
      # @api beta This API may be changed or removed in a future release.
      #

      def logs
        WebDriver.logger.deprecate('Manager#logs', 'Chrome::Driver#logs')
        @logs ||= Logs.new(@bridge)
      end

      #
      # Create a new top-level browsing context
      # https://w3c.github.io/webdriver/#new-window
      # @param type [Symbol] Supports two values: :tab and :window.
      #  Use :tab if you'd like the new window to share an OS-level window
      #  with the current browsing context.
      #  Use :window otherwise
      # @return [String] The value of the window handle
      #
      def new_window(type = :tab)
        case type
        when :tab, :window
          result = @bridge.new_window(type)
          unless result.key?('handle')
            raise UnknownError, "the driver did not return a handle. " \
                                "The returned result: #{result.inspect}"
          end
          result['handle']
        else
          raise ArgumentError, "invalid argument for type. Got: '#{type.inspect}'. " \
                               "Try :tab or :window"
        end
      end

      #
      # @api beta This API may be changed or removed in a future release.
      #

      def window
        @window ||= Window.new(@bridge)
      end

      private

      SECONDS_PER_DAY = 86_400.0

      def datetime_at(int)
        DateTime.civil(1970) + (int / SECONDS_PER_DAY)
      end

      def seconds_from(obj)
        case obj
        when Time
          obj.to_f
        when DateTime
          (obj - DateTime.civil(1970)) * SECONDS_PER_DAY
        when Numeric
          obj
        else
          raise ArgumentError, "invalid value for expiration date: #{obj.inspect}"
        end
      end

      def strip_port(str)
        str.split(':', 2).first
      end

      def convert_cookie(cookie)
        {
          name: cookie['name'],
          value: cookie['value'],
          path: cookie['path'],
          domain: cookie['domain'] && strip_port(cookie['domain']),
          expires: cookie['expiry'] && datetime_at(cookie['expiry']),
          same_site: cookie['sameSite'],
          http_only: cookie['httpOnly'],
          secure: cookie['secure']
        }
      end
    end # Options
  end # WebDriver
end # Selenium
