module Selenium
  module WebDriver
    module Remote
      #
      # Specification of the desired and/or actual capabilities of the browser that the
      # server is being asked to create.
      #
      class Capabilities

        DEFAULTS = {
          :browser_name          => "",
          :version               => "",
          :platform              => :any,
          :javascript_enabled    => false,
          :css_selectors_enabled => false,
          :takes_screenshot      => false,
          :native_events         => false,
          :rotatable             => false,
          :firefox_profile       => nil,
          :proxy                 => nil
        }

        DEFAULTS.each_key do |key|
          define_method key do
            @capabilities.fetch(key)
          end

          define_method "#{key}=" do |value|
            @capabilities[key] = value
          end
        end

        alias_method :css_selectors_enabled?, :css_selectors_enabled
        alias_method :javascript_enabled?   , :javascript_enabled
        alias_method :native_events?        , :native_events
        alias_method :takes_screenshot?     , :takes_screenshot
        alias_method :rotatable?            , :rotatable

        #
        # Convenience methods for the common choices.
        #

        class << self
          def android(opts = {})
            new({
              :browser_name     => "android",
              :platform         => :android,
              :rotatable        => true,
              :takes_screenshot => true
            }.merge(opts))
          end

          def chrome(opts = {})
            new({
              :browser_name          => "chrome",
              :javascript_enabled    => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end

          def firefox(opts = {})
            new({
              :browser_name          => "firefox",
              :javascript_enabled    => true,
              :takes_screenshot      => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end

          def htmlunit(opts = {})
            new({
              :browser_name => "htmlunit"
            }.merge(opts))
          end

          def internet_explorer(opts = {})
            new({
              :browser_name          => "internet explorer",
              :platform              => :windows,
              :takes_screenshot      => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end
          alias_method :ie, :internet_explorer

          def iphone(opts = {})
            new({
              :browser_name       => "iPhone",
              :platform           => :mac,
              :javascript_enabled => true
            }.merge(opts))
          end

          def ipad(opts = {})
            new({
              :browser_name       => "iPad",
              :platform           => :mac,
              :javascript_enabled => true
            }.merge(opts))
          end

          def opera(opts = {})
            new({
              :browser_name          => "opera",
              :javascript_enabled    => true,
              :takes_screenshot      => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end

          def phantomjs(opts = {})
            new({
              :browser_name          => "phantomjs",
              :javascript_enabled    => true,
              :takes_screenshot      => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end

          def safari(opts = {})
            new({
              :browser_name          => "safari",
              :javascript_enabled    => true,
              :takes_screenshot      => true,
              :css_selectors_enabled => true
            }.merge(opts))
          end

          #
          # @api private
          #

          def json_create(data)
            data = data.dup

            caps = new
            caps.browser_name          = data.delete("browserName")
            caps.version               = data.delete("version")
            caps.platform              = data.delete("platform").downcase.to_sym if data.has_key?('platform')
            caps.javascript_enabled    = data.delete("javascriptEnabled")
            caps.css_selectors_enabled = data.delete("cssSelectorsEnabled")
            caps.takes_screenshot      = data.delete("takesScreenshot")
            caps.native_events         = data.delete("nativeEvents")
            caps.rotatable             = data.delete("rotatable")
            caps.proxy                 = Proxy.json_create(data['proxy']) if data.has_key?('proxy')

            # any remaining pairs will be added as is, with no conversion
            caps.merge!(data)

            caps
          end
        end

        # @option :browser_name           [String] required browser name
        # @option :version                [String] required browser version number
        # @option :platform               [Symbol] one of :any, :win, :mac, or :x
        # @option :javascript_enabled     [Boolean] does the driver have javascript enabled?
        # @option :css_selectors_enabled  [Boolean] does the driver support CSS selectors?
        # @option :takes_screenshot       [Boolean] can this driver take screenshots?
        # @option :native_events          [Boolean] does this driver use native events?
        # @option :proxy                  [Selenium::WebDriver::Proxy, Hash] proxy configuration
        #
        # Firefox-specific options:
        #
        # @option :firefox_profile        [Selenium::WebDriver::Firefox::Profile] the firefox profile to use
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
          if other.respond_to?(:capabilities) && other.capabilities.kind_of?(Hash)
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
            when :firefox_profile
              hash['firefox_profile'] = value.as_json['zip'] if value
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

      end # Capabilities
    end # Remote
  end # WebDriver
end # Selenium
