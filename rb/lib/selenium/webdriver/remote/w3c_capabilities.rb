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
        STANDARD = [:browser_name,
                    :browser_version,
                    :platform_name,
                    :accept_insecure_certs,
                    :page_load_strategy,
                    :proxy,
                    :set_window_rect,
                    :timeouts,
                    :unhandled_prompt_behavior]

        STANDARD.each do |key|
          define_method(key) { @capabilities[key] }
          define_method("#{key}=") { |value| @capabilities[key] = value }
        end

        [:implicit_timeout, :page_load_timeout, :script_timeout].each do |key|
          capability = if key == :page_load_timeout
                         'page load'
                       else
                         key.to_s.gsub('_timeout', '').to_sym
                       end
          define_method(key) { @capabilities[:timeouts][capability] }
          define_method("#{key}=") { |value| @capabilities[:timeouts][capability] = value }
        end

        class << self
          def edge(opts = {})
            new({browser_name: 'MicrosoftEdge',
                 platform_name: :windows}.merge(opts))
          end

          def firefox(opts = {})
            define_method(:accessibility_checks) { @capabilities.fetch(:accessibility_checks, {}) }
            define_method(:accessibility_checks=) { |value| @capabilities[:accessibility_checks] = value }

            define_method(:options) { @capabilities[:firefox_options] ||= {} }
            define_method(:options=) { |value| @capabilities[:firefox_options] = value }
            alias_method :firefox_options, :options
            alias_method :firefox_options=, :options=

            define_method(:profile) { firefox_options[:profile] ||= {} }
            define_method(:profile=) { |value| firefox_options[:profile] = value.encoded }
            alias_method :firefox_profile, :profile
            alias_method :firefox_profile=, :profile=

            new({browser_name: 'firefox'}.merge(opts))
          end

          alias_method :ff, :firefox

          def w3c?(opts = {})
            if opts[:marionette] == false
              false
            elsif opts[:desired_capabilities].nil? || opts[:desired_capabilities].is_a?(W3CCapabilities)
              true
            elsif opts[:desired_capabilities][:marionette] == false
              false
            else
              true
            end
          end

          #
          # @api private
          #

          def camel_case(str)
            str.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
          end

          def json_create(data)
            data = data.dup

            caps = new

            proxy = data.delete('proxy') if data.key?('proxy')
            STANDARD.each do |cap|
              caps.send("#{cap}=", data.delete(camel_case(cap.to_s)))
            end

            caps.proxy = Proxy.json_create(proxy) unless proxy.nil? || proxy.empty?

            # Marionette Specific
            caps.accessibility_checks = data.delete('moz:accessibilityChecks') if data.key?('moz:accessibilityChecks')
            caps.firefox_options = data.delete('moz:firefoxOptions') if data.key?('moz:firefoxOptions')

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
        # @option :accept_insecure_certs    [Boolean] does the driver accept SSL Cerfifications?
        # @option :proxy                    [Selenium::WebDriver::Proxy, Hash] proxy configuration
        #
        # @api public
        #

        def initialize(opts = {})
          opts[:browser_version] = opts.delete(:version) if opts.key?(:version)
          opts[:platform_name] = opts.delete(:platform) if opts.key?(:platform)
          @capabilities = opts
          self.proxy = opts.delete(:proxy) if opts.key?(:proxy)
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

        # @api private
        #

        def as_json(*)
          hash = {}

          @capabilities.each do |key, value|
            case key
            when :proxy
              hash['proxy'] = value.as_json if value
            when :firefox_options
              hash['moz:firefoxOptions'] = value
            when String
              hash[key.to_s] = value
            when Symbol
              hash[self.class.camel_case(key.to_s)] = value
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

      end # W3CCapabilities
    end # Remote
  end # WebDriver
end # Selenium
