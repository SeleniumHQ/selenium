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
      #
      # Specification of the desired and/or actual capabilities of the browser that the
      # server is being asked to create.
      #
      class W3CCapabilities

        DEFAULTS = {
          :browser_name => '',
          :browser_version => :any,
          :platform_name => :any,
          :platform_version => :any,
          :accept_ssl_certs => false,
          :takes_screenshot => false,
          :takes_element_screenshot => false,
          :page_load_strategy => 'normal',
          :proxy => nil
        }

        DEFAULTS.each_key do |key|
          define_method key do
            @capabilities.fetch(key)
          end

          define_method "#{key}=" do |value|
            @capabilities[key] = value
          end
        end

        alias_method :version, :browser_version

        #
        # Convenience methods for the common choices.
        #

        class << self

          def edge(opts = {})
            new({
              :browser_name => "MicrosoftEdge",
              :platform => :windows,
                }.merge(opts))
          end

          def firefox(opts = {})
            new({
              :browser_name => "firefox"
                }.merge(opts))
          end

          alias_method :ff, :firefox

          def w3c?(opts = {})
            return false unless opts[:desired_capabilities].is_a?(W3CCapabilities) || opts.delete(:marionette)
            Firefox::Binary.path = ENV['MARIONETTE_PATH'] if ENV['MARIONETTE_PATH']
            firefox_version = Firefox::Binary.version
            raise ArgumentError, "Firefox Version #{firefox_version} does not support W3CCapabilities" if firefox_version < 43
            true
          end

          #
          # @api private
          #

          def json_create(data)
            data = data.dup

            caps = new
            caps.browser_name = data.delete("browserName")
            caps.browser_version = data.delete("browserVersion")
            caps.platform_name = data.delete("platformName").downcase.to_sym if data.has_key?('platform')
            caps.platform_version = data.delete("platformVersion")
            caps.accept_ssl_certs = data.delete("acceptSslCerts")
            caps.takes_screenshot = data.delete("takesScreenshot  ")
            caps.takes_element_screenshot = data.delete("takesElementScreenshot")
            caps.page_load_strategy = data.delete("pageLoadStrategy")
            caps.proxy = Proxy.json_create(data['proxy']) if data.has_key?('proxy')

            # any remaining pairs will be added as is, with no conversion
            caps.merge!(data)

            caps
          end
        end

        # @param [Hash] opts
        # @option :browser_name             [String] required browser name
        # @option :browser_version          [String] required browser version number
        # @option :platform_name            [Symbol] one of :any, :win, :mac, or :x
        # @option :platform_version         [String] required platform version number
        # @option :accept_ssl_certs         [Boolean] does the driver accept SSL Cerfifications?
        # @option :takes_screenshot         [Boolean] can this driver take screenshots?
        # @option :takes_element_screenshot [Boolean] can this driver take element screenshots?
        # @option :proxy                    [Selenium::WebDriver::Proxy, Hash] proxy configuration
        #
        # @api public
        #

        def initialize(opts = {})
          @capabilities = DEFAULTS.merge(opts)
          self.proxy = opts.delete(:proxy)
        end

        #
        # Allows setting arbitrary capabilities.
        #

        def []=(key, value)
          @capabilities[key] = value
        end

        def [](key)
          @capabilities[key]
        end

        def merge!(other)
          if other.respond_to?(:capabilities, true) && other.capabilities.kind_of?(Hash)
            @capabilities.merge! other.capabilities
          elsif other.kind_of? Hash
            @capabilities.merge! other
          else
            raise ArgumentError, "argument should be a Hash or implement #capabilities"
          end
        end

        def proxy=(proxy)
          case proxy
          when Hash
            @capabilities[:proxy] = Proxy.new(proxy)
          when Proxy, nil
            @capabilities[:proxy] = proxy
          else
            raise TypeError, "expected Hash or #{Proxy.name}, got #{proxy.inspect}:#{proxy.class}"
          end
        end

        # @api private
        #

        def as_json(opts = nil)
          hash = {}

          @capabilities.each do |key, value|
            case key
            when :platform
              hash['platform'] = value.to_s.upcase
            when :proxy
              hash['proxy'] = value.as_json if value
            when String, :firefox_binary
              hash[key.to_s] = value
            when Symbol
              hash[camel_case(key.to_s)] = value
            else
              raise TypeError, "expected String or Symbol, got #{key.inspect}:#{key.class} / #{value.inspect}"
            end
          end

          hash
        end

        def to_json(*args)
          WebDriver.json_dump as_json
        end

        def ==(other)
          return false unless other.kind_of? self.class
          as_json == other.as_json
        end

        alias_method :eql?, :==

        protected

        def capabilities
          @capabilities
        end

        private

        def camel_case(str)
          str.gsub(/_([a-z])/) { $1.upcase }
        end

      end # W3CCapabilities
    end # Remote
  end # WebDriver
end # Selenium
