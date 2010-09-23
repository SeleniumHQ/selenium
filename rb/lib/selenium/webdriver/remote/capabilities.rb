module Selenium
  module WebDriver
    module Remote

      #
      # Specification of the desired and/or actual capabilities of the browser that the
      # server is being asked to create.
      #
      class Capabilities

        attr_accessor :browser_name, :version, :platform, :javascript_enabled
        alias_method :javascript?, :javascript_enabled

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
              :browser_name => "iphone",
              :platform     => :mac
            }.merge(opts))
          end

          def chrome(opts = {})
            new({
              :browser_name       => "chrome",
              :javascript_enabled => true
            }.merge(opts))
          end

          #
          # @api private
          #

          def json_create(data)
            new(
              :browser_name       => data["browserName"],
              :version            => data["version"],
              :platform           => data["platform"].downcase.to_sym,
              :javascript_enabled => data["javascriptEnabled"]
            )
          end
        end

        # @option :browser_name        [String] required browser name
        # @option :version             [String] required browser version number
        # @option :platform            [Symbol] one of :any, :win, :mac, or :x
        # @option :javascript_enabled  [Boolean] should the test run with javascript enabled?
        #
        # @api public
        #

        def initialize(opts = {})
          @browser_name       = opts[:browser_name]       || ""
          @version            = opts[:version]            || ""
          @platform           = opts[:platform]           || :any
          @javascript_enabled = opts[:javascript_enabled] || false
        end

        #
        # @api private
        #

        def to_json(*args)
          {
            "browserName"       => browser_name,
            "version"           => version,
            "platform"          => platform.to_s.upcase,
            "javascriptEnabled" => javascript?
          }.to_json(*args)
        end

      end # Capabilities
    end # Remote
  end # WebDriver
end # Selenium