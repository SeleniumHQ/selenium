module Selenium
  module WebDriver
    module IPhone
      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://#{Platform.localhost}:3001/hub/"

        def initialize(opts = {})
          remote_opts = {
            :url                  => opts.fetch(:url, DEFAULT_URL),
            :desired_capabilities => opts.fetch(:desired_capabilities, capabilities),
          }

          remote_opts[:http_client] = opts[:http_client] if opts.has_key?(:http_client)

          super remote_opts
        end

        def browser
          :iphone
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.iphone
        end

      end # Bridge
    end # IPhone
  end # WebDriver
end # Selenium