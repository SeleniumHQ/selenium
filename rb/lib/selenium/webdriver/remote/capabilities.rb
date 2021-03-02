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

        KNOWN = [
          :browser_name,
          :browser_version,
          :platform_name,
          :accept_insecure_certs,
          :page_load_strategy,
          :proxy,
          :set_window_rect,
          :timeouts,
          :unhandled_prompt_behavior,
          :strict_file_interactability,

          # remote-specific
          :remote_session_id,

          # TODO: (AR) deprecate compatibility with OSS-capabilities
          :implicit_timeout,
          :page_load_timeout,
          :script_timeout
        ].freeze

        KNOWN.each do |key|
          define_method key do
            @capabilities.fetch(key)
          end

          next if key == :proxy

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
          def chrome(opts = {})
            new({
              browser_name: 'chrome'
            }.merge(opts))
          end

          def edge(opts = {})
            new({
              browser_name: 'MicrosoftEdge'
            }.merge(opts))
          end

          def firefox(opts = {})
            opts[:browser_version] = opts.delete(:version) if opts.key?(:version)
            opts[:platform_name] = opts.delete(:platform) if opts.key?(:platform)
            opts[:timeouts] = {}
            opts[:timeouts]['implicit'] = opts.delete(:implicit_timeout) if opts.key?(:implicit_timeout)
            opts[:timeouts]['pageLoad'] = opts.delete(:page_load_timeout) if opts.key?(:page_load_timeout)
            opts[:timeouts]['script'] = opts.delete(:script_timeout) if opts.key?(:script_timeout)
            opts.delete(:timeouts) if opts[:timeouts].empty?
            new({browser_name: 'firefox'}.merge(opts))
          end

          alias_method :ff, :firefox

          def safari(opts = {})
            new({
              browser_name: Selenium::WebDriver::Safari.technology_preview? ? "Safari Technology Preview" : 'safari'
            }.merge(opts))
          end

          def htmlunit(opts = {})
            new({
              browser_name: 'htmlunit'
            }.merge(opts))
          end

          def internet_explorer(opts = {})
            new({
              browser_name: 'internet explorer',
              platform_name: :windows
            }.merge(opts))
          end
          alias_method :ie, :internet_explorer

          #
          # @api private
          #

          def json_create(data)
            data = data.dup

            caps = new
            (KNOWN - %i[timeouts proxy]).each do |cap|
              data_value = camel_case(cap)
              caps[cap] = data.delete(data_value) if data.key?(data_value)
            end

            process_timeouts(caps, data.delete('timeouts'))

            if data.key?('proxy')
              proxy = data.delete('proxy')
              caps.proxy = Proxy.json_create(proxy) unless proxy.nil? || proxy.empty?
            end

            # Remote Server Specific
            if data.key?('webdriver.remote.sessionid')
              caps[:remote_session_id] = data.delete('webdriver.remote.sessionid')
            end

            # any remaining pairs will be added as is, with no conversion
            caps.merge!(data)

            caps
          end

          def camel_case(str_or_sym)
            str_or_sym.to_s.gsub(/_([a-z])/) { Regexp.last_match(1).upcase }
          end

          private

          def process_timeouts(caps, timeouts)
            return if timeouts.nil?

            caps.implicit_timeout = timeouts['implicit']
            caps.page_load_timeout = timeouts['pageLoad']
            caps.script_timeout = timeouts['script']
          end
        end

        #
        # @param [Hash] opts
        # @option :browser_name             [String] required browser name
        # @option :browser_version          [String] required browser version number
        # @option :platform_name            [Symbol] one of :any, :win, :mac, or :x
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
              next unless value

              process_proxy(hash, value)
            when :unhandled_prompt_behavior
              hash['unhandledPromptBehavior'] = value.is_a?(Symbol) ? value.to_s.tr('_', ' ') : value
            when String
              hash[key.to_s] = value
            when Symbol
              hash[self.class.camel_case(key)] = value
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

        def process_proxy(hash, value)
          hash['proxy'] = value.as_json
          hash['proxy']['proxyType'] &&= hash['proxy']['proxyType'].downcase

          return unless hash['proxy']['noProxy'].is_a?(String)

          hash['proxy']['noProxy'] = hash['proxy']['noProxy'].split(', ')
        end
      end # Capabilities
    end # Remote
  end # WebDriver
end # Selenium
