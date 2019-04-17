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
    module Remote
      #
      # Specification of the desired and/or actual capabilities of the browser that the
      # server is being asked to create.
      #
      class Capabilities
        DEFAULTS = {
          browser_name: '',
          version: '',
          platform: :any,
          javascript_enabled: false,
          css_selectors_enabled: false,
          takes_screenshot: false,
          native_events: false,
          rotatable: false,
          firefox_profile: nil,
          proxy: nil
        }.freeze

        DEFAULTS.each_key do |key|
          if key != :javascript_enabled
            define_method key do
              @capabilities.fetch(key)
            end
          end

          next if key == :proxy

          define_method "#{key}=" do |value|
            @capabilities[key] = value
          end
        end

        #
        # Returns javascript_enabled capability.
        # It is true if not set explicitly.
        #
        def javascript_enabled
          javascript_enabled = @capabilities.fetch(:javascript_enabled)
          javascript_enabled.nil? ? true : javascript_enabled
        end

        alias_method :css_selectors_enabled?, :css_selectors_enabled
        alias_method :javascript_enabled?, :javascript_enabled
        alias_method :native_events?, :native_events
        alias_method :takes_screenshot?, :takes_screenshot
        alias_method :rotatable?, :rotatable

        #
        # Convenience methods for the common choices.
        #

        class << self
          def chrome(opts = {})
            new({
              browser_name: 'chrome',
              javascript_enabled: true,
              css_selectors_enabled: true
            }.merge(opts))
          end

          def edge(opts = {})
            new({
              browser_name: 'MicrosoftEdge',
              platform: :windows
            }.merge(opts))
          end

          def firefox(opts = {})
            opts[:browser_version] = opts.delete(:version) if opts.key?(:version)
            opts[:platform_name] = opts.delete(:platform) if opts.key?(:platform)
            opts[:timeouts] = {}
            opts[:timeouts]['implicit'] = opts.delete(:implicit_timeout) if opts.key?(:implicit_timeout)
            opts[:timeouts]['pageLoad'] = opts.delete(:page_load_timeout) if opts.key?(:page_load_timeout)
            opts[:timeouts]['script'] = opts.delete(:script_timeout) if opts.key?(:script_timeout)
            new({browser_name: 'firefox', marionette: true}.merge(opts))
          end

          def firefox_legacy(opts = {})
            new({
              browser_name: 'firefox',
              javascript_enabled: true,
              takes_screenshot: true,
              css_selectors_enabled: true
            }.merge(opts))
          end

          def htmlunit(opts = {})
            new({
              browser_name: 'htmlunit'
            }.merge(opts))
          end

          def htmlunitwithjs(opts = {})
            new({
              browser_name: 'htmlunit',
              javascript_enabled: true
            }.merge(opts))
          end

          def internet_explorer(opts = {})
            new({
              browser_name: 'internet explorer',
              platform: :windows,
              takes_screenshot: true,
              css_selectors_enabled: true,
              native_events: true
            }.merge(opts))
          end
          alias_method :ie, :internet_explorer

          def phantomjs(opts = {})
            WebDriver.logger.deprecate 'Selenium support for PhantomJS', 'headless Chrome/Firefox or HTMLUnit'
            new({
              browser_name: 'phantomjs',
              javascript_enabled: true,
              takes_screenshot: true,
              css_selectors_enabled: true
            }.merge(opts))
          end

          def safari(opts = {})
            new({
              browser_name: 'safari',
              platform: :mac,
              javascript_enabled: true,
              takes_screenshot: true,
              css_selectors_enabled: true
            }.merge(opts))
          end

          #
          # @api private
          #

          def json_create(data)
            data = data.dup

            caps = new
            caps.browser_name          = data.delete('browserName')
            caps.version               = data.delete('version')
            caps.platform              = data.delete('platform').downcase.tr(' ', '_').to_sym if data.key?('platform')
            caps.javascript_enabled    = data.delete('javascriptEnabled')
            caps.css_selectors_enabled = data.delete('cssSelectorsEnabled')
            caps.takes_screenshot      = data.delete('takesScreenshot')
            caps.native_events         = data.delete('nativeEvents')
            caps.rotatable             = data.delete('rotatable')
            caps.proxy                 = Proxy.json_create(data['proxy']) if data.key?('proxy') && !data['proxy'].empty?

            # any remaining pairs will be added as is, with no conversion
            caps.merge!(data)

            caps
          end
        end

        #
        # @option :browser_name           [String] required browser name
        # @option :version                [String] required browser version number
        # @option :platform               [Symbol] one of :any, :win, :mac, or :x
        # @option :javascript_enabled     [Boolean] does the driver have javascript enabled?
        # @option :css_selectors_enabled  [Boolean] does the driver support CSS selectors?
        # @option :takes_screenshot       [Boolean] can this driver take screenshots?
        # @option :native_events          [Boolean] does this driver use native events?
        # @option :proxy                  [Selenium::WebDriver::Proxy, Hash] proxy configuration
        #
        # @api public
        #

        def initialize(opts = {})
          @capabilities = DEFAULTS.merge(opts)
          self.proxy    = opts.delete(:proxy)
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
          if other.respond_to?(:capabilities, true) && other.capabilities.is_a?(Hash)
            @capabilities.merge! other.capabilities
          elsif other.is_a? Hash
            @capabilities.merge! other
          else
            raise ArgumentError, 'argument should be a Hash or implement #capabilities'
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

        #
        # @api private
        #

        def as_json(*) # rubocop:disable Metrics/CyclomaticComplexity
          hash = {}

          @capabilities.each do |key, value|
            case key
            when :platform
              hash['platform'] = value.to_s.upcase
            when :firefox_profile
              if value
                WebDriver.logger.deprecate(':firefox_profile capabilitiy', 'Selenium::WebDriver::Firefox::Options#profile')
                hash['firefox_profile'] = value.as_json['zip']
              end
            when :proxy
              hash['proxy'] = value.as_json if value
            when String, :firefox_binary
              if key == :firefox_binary && value
                WebDriver.logger.deprecate(':firefox_binary capabilitiy', 'Selenium::WebDriver::Firefox::Options#binary')
              end
              hash[key.to_s] = value
            when Symbol
              hash[camel_case(key.to_s)] = value
            else
              raise TypeError, "expected String or Symbol, got #{key.inspect}:#{key.class} / #{value.inspect}"
            end
          end

          hash
        end

        def to_json(*)
          JSON.generate as_json
        end

        def ==(other)
          return false unless other.is_a? self.class

          as_json == other.as_json
        end
        alias_method :eql?, :==

        protected

        attr_reader :capabilities

        private

        def camel_case(str)
          str.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
        end
      end # Capabilities
    end # Remote
  end # WebDriver
end # Selenium
