module Selenium
  module WebDriver
    module Remote
      #
      # Specification of the desired and/or actual capabilities of the browser that the
      # server is being asked to create.
      #
      class Capabilities

        attr_reader :proxy

        attr_accessor :css_selectors_enabled,
                      :javascript_enabled,
                      :native_events,
                      :platform,
                      :takes_screenshot,
                      :rotatable,
                      :version,
                      :browser_name

        alias_method :css_selectors_enabled?, :css_selectors_enabled
        alias_method :javascript_enabled?   , :javascript_enabled
        alias_method :native_events?        , :native_events
        alias_method :takes_screenshot?     , :takes_screenshot
        alias_method :rotatable?            , :rotatable

        #
        # Convenience methods for the common choices.
        #

        class << self
          def firefox(opts = {})
            new({
              :browser_name => "firefox",
              :javascript_enabled => true
            }.merge(opts))
          end

          def internet_explorer(opts = {})
            new({
              :browser_name => "internet explorer",
              :platform     => :windows
            }.merge(opts))
          end

          def htmlunit(opts = {})
            new({
              :browser_name => "htmlunit"
            }.merge(opts))
          end

          def safari(opts = {})
            new({
              :browser_name => "safari",
              :platform     => :mac
            }.merge(opts))
          end

          def iphone(opts = {})
            new({
              :browser_name       => "iphone",
              :platform           => :mac,
              :javascript_enabled => true
            }.merge(opts))
          end

          def chrome(opts = {})
            new({
              :browser_name       => "chrome",
              :javascript_enabled => true
            }.merge(opts))
          end

          def android(opts = {})
            new({
              :browser_name     => "android",
              :platform         => :android,
              :rotatable        => true,
              :takes_screenshot => true
            }.merge(opts))
          end

          #
          # @api private
          #

          def json_create(data)
            new(
              :browser_name          => data["browserName"],
              :version               => data["version"],
              :platform              => data["platform"].downcase.to_sym,
              :javascript_enabled    => data["javascriptEnabled"],
              :css_selectors_enabled => data["cssSelectorsEnabled"],
              :takes_screenshot      => data["takesScreenshot"],
              :native_events         => data["nativeEvents"],
              :rotatable             => data["rotatable"],
              :proxy                 => (Proxy.json_create(data['proxy']) if data['proxy'])
            )
          end
        end

        # @option :browser_name           [String] required browser name
        # @option :version                [String] required browser version number
        # @option :platform               [Symbol] one of :any, :win, :mac, or :x
        # @option :javascript_enabled     [Boolean] does the driver have javascript enabled?
        # @option :css_selectors_enabled  [Boolean] does the driver support CSS selectors?
        # @option :takes_screenshot       [Boolean] can this driver take screenshots?
        # @option :native_events         [Boolean] does this driver use native events?
        # @option :proxy                 [Selenium::WebDriver::Proxy, Hash] proxy configuration
        #
        # @api public
        #

        def initialize(opts = {})
          @browser_name          = opts[:browser_name]          || ""
          @version               = opts[:version]               || ""
          @platform              = opts[:platform]              || :any
          @javascript_enabled    = opts[:javascript_enabled]    || false
          @css_selectors_enabled = opts[:css_selectors_enabled] || false
          @takes_screenshot      = opts[:takes_screenshot]      || false
          @native_events         = opts[:native_events]         || false
          @rotatable             = opts[:rotatable]             || false

          self.proxy             = opts[:proxy]
        end

        def proxy=(proxy)
          case proxy
          when Hash
            @proxy = Proxy.new(proxy)
          when Proxy, nil
            @proxy = proxy
          else
            raise TypeError, "expected Hash or #{Proxy.name}, got #{proxy.inspect}:#{proxy.class}"
          end
        end

        # @api private
        #

        def as_json(opts = nil)
          hash = {
            "browserName"         => browser_name,
            "version"             => version,
            "platform"            => platform.to_s.upcase,
            "javascriptEnabled"   => javascript_enabled?,
            "cssSelectorsEnabled" => css_selectors_enabled?,
            "takesScreenshot"     => takes_screenshot?,
            "nativeEvents"        => native_events?,
            "rotatable"           => rotatable?
          }

          hash["proxy"] = proxy.as_json if proxy

          hash
        end

        def to_json(*args)
          as_json.to_json(*args)
        end

        def ==(other)
          return false unless other.kind_of? self.class
          as_json == other.as_json
        end
        alias_method :eql?, :==

      end # Capabilities
    end # Remote
  end # WebDriver
end # Selenium