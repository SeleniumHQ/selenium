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
      def self.const_missing(const_name)
        super unless const_name == :W3CCapabilities
        WebDriver.logger.deprecate 'Selenium::WebDriver::Remote::W3CCapabilities', 'Selenium::WebDriver::Remote::Capabilities'
        W3C::Capabilities
      end

      module W3C

        #
        # Specification of the desired and/or actual capabilities of the browser that the
        # server is being asked to create.
        #
        # @api private
        #

        # TODO - uncomment when Mozilla fixes this:
        # https://bugzilla.mozilla.org/show_bug.cgi?id=1326397
        class Capabilities

          EXTENSION_CAPABILITY_PATTERN = /\A[\w-]+:.*\z/

          # TODO (alex): compare with spec
          KNOWN = [
            :browser_name,
            :browser_version,
            :platform_name,
            :platform_version,
            :accept_insecure_certs,
            :page_load_strategy,
            :proxy,
            :remote_session_id,
            :accessibility_checks,
            :device,
            :implicit_timeout,
            :page_load_timeout,
            :script_timeout,
            :unhandled_prompt_behavior,
            :timeouts,
          ].freeze

          KNOWN.each do |key|
            define_method key do
              @capabilities.fetch(key)
            end

            define_method "#{key}=" do |value|
              @capabilities[key] = value
            end
          end

          #
          # Backward compatibility
          #

          alias_method :version, :browser_version
          alias_method :version=, :browser_version=
          alias_method :platform, :platform_name
          alias_method :platform=, :platform_name=

          #
          # Convenience methods for the common choices.
          #

          class << self
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
              opts[:timeouts]['page load'] = opts.delete(:page_load_timeout) if opts.key?(:page_load_timeout)
              opts[:timeouts]['script'] = opts.delete(:script_timeout) if opts.key?(:script_timeout)
              new({browser_name: 'firefox', marionette: true}.merge(opts))
            end

            alias_method :ff, :firefox

            #
            # @api private
            #

            def json_create(data)
              data = data.dup

              caps = new
              caps.browser_name = data.delete('browserName')
              caps.browser_version = data.delete('browserVersion')
              caps.platform_name = data.delete('platformName')
              caps.platform_version = data.delete('platformVersion')
              caps.accept_insecure_certs = data.delete('acceptInsecureCerts') if data.key?('acceptInsecureCerts')
              caps.page_load_strategy = data.delete('pageLoadStrategy')
              timeouts = data.delete('timeouts')
              caps.implicit_timeout = timeouts['implicit'] if timeouts
              caps.page_load_timeout = timeouts['pageLoad'] if timeouts
              caps.script_timeout = timeouts['script'] if timeouts

              proxy = data.delete('proxy')
              caps.proxy = Proxy.json_create(proxy) unless proxy.nil? || proxy.empty?

              # Remote Server Specific
              caps[:remote_session_id] = data.delete('webdriver.remote.sessionid')

              # Marionette Specific
              caps[:accessibility_checks] = data.delete('moz:accessibilityChecks')
              caps[:profile] = data.delete('moz:profile')
              caps[:rotatable] = data.delete('rotatable')
              caps[:device] = data.delete('device')

              # any remaining pairs will be added as is, with no conversion
              caps.merge!(data)

              caps
            end

            #
            # Creates W3C compliant capabilities from OSS ones.
            # @param oss_capabilities [Hash, Remote::Capabilities]
            #

            def from_oss(oss_capabilities)
              w3c_capabilities = new

              # TODO (alex): make capabilities enumerable?
              oss_capabilities = oss_capabilities.__send__(:capabilities) unless oss_capabilities.is_a?(Hash)
              oss_capabilities.each do |name, value|
                next if value.nil?
                next if value.is_a?(String) && value.empty?

                capability_name = name.to_s

                snake_cased_capability_names = KNOWN.map(&:to_s)
                camel_cased_capability_names = snake_cased_capability_names.map(&w3c_capabilities.method(:camel_case))

                next unless snake_cased_capability_names.include?(capability_name) ||
                            camel_cased_capability_names.include?(capability_name) ||
                            capability_name.match(EXTENSION_CAPABILITY_PATTERN)

                w3c_capabilities[name] = value
              end

              # User can pass :firefox_options or :firefox_profile.
              #
              # TODO (alex): Refactor this whole method into converter class.
              firefox_options = oss_capabilities['firefoxOptions'] || oss_capabilities['firefox_options'] || oss_capabilities[:firefox_options]
              firefox_profile = oss_capabilities['firefox_profile'] || oss_capabilities[:firefox_profile]
              firefox_binary  = oss_capabilities['firefox_binary'] || oss_capabilities[:firefox_binary]

              if firefox_profile && firefox_options
                second_profile = firefox_options['profile'] || firefox_options[:profile]
                if second_profile && firefox_profile != second_profile
                  raise Error::WebDriverError, 'You cannot pass 2 different Firefox profiles'
                end
              end

              if firefox_options || firefox_profile || firefox_binary
                options = WebDriver::Firefox::Options.new(firefox_options || {})
                options.binary = firefox_binary if firefox_binary
                options.profile = firefox_profile if firefox_profile
                w3c_capabilities.merge!(options.as_json)
              end

              w3c_capabilities
            end
          end

          #
          # @param [Hash] opts
          # @option :browser_name             [String] required browser name
          # @option :browser_version          [String] required browser version number
          # @option :platform_name            [Symbol] one of :any, :win, :mac, or :x
          # @option :platform_version         [String] required platform version number
          # @option :accept_insecure_certs    [Boolean] does the driver accept insecure SSL certifications?
          # @option :proxy                    [Selenium::WebDriver::Proxy, Hash] proxy configuration
          #
          # @api public
          #

          def initialize(opts = {})
            @capabilities = opts
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

          def as_json(*)
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
      end # W3c
    end # Remote
  end # WebDriver
end # Selenium
