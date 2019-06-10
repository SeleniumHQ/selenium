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
            edge_html(opts)
          end

          def edge_html(opts = {})
            new({
              browser_name: 'MicrosoftEdge',
              platform_name: :windows
            }.merge(opts))
          end

          def edge_chrome(opts = {})
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
            new({browser_name: 'firefox'}.merge(opts))
          end

          alias_method :ff, :firefox

          def safari(opts = {})
            new({
              browser_name: 'safari',
              platform_name: :mac
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
            caps.browser_name = data.delete('browserName') if data.key?('browserName')
            caps.browser_version = data.delete('browserVersion') if data.key?('browserVersion')
            caps.platform_name = data.delete('platformName') if data.key?('platformName')
            caps.accept_insecure_certs = data.delete('acceptInsecureCerts') if data.key?('acceptInsecureCerts')
            caps.page_load_strategy = data.delete('pageLoadStrategy') if data.key?('pageLoadStrategy')

            if data.key?('timeouts')
              timeouts = data.delete('timeouts')
              caps.implicit_timeout = timeouts['implicit'] if timeouts
              caps.page_load_timeout = timeouts['pageLoad'] if timeouts
              caps.script_timeout = timeouts['script'] if timeouts
            end

            if data.key?('proxy')
              proxy = data.delete('proxy')
              caps.proxy = Proxy.json_create(proxy) unless proxy.nil? || proxy.empty?
            end

            # Remote Server Specific
            caps[:remote_session_id] = data.delete('webdriver.remote.sessionid') if data.key?('webdriver.remote.sessionid')

            # any remaining pairs will be added as is, with no conversion
            caps.merge!(data)

            caps
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
              if value
                hash['proxy'] = value.as_json
                hash['proxy']['proxyType'] &&= hash['proxy']['proxyType'].downcase
                hash['proxy']['noProxy'] = hash['proxy']['noProxy'].split(', ') if hash['proxy']['noProxy'].is_a?(String)
              end
            when String
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
