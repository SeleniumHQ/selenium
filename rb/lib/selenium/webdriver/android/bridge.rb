module Selenium
  module WebDriver
    module Android

      #
      # @api private
      #

      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://#{Platform.localhost}:8080/wd/hub/"

        def initialize(opts = {})
          remote_opts = {
            :url                  => opts.fetch(:url, DEFAULT_URL),
            :desired_capabilities => opts.fetch(:desired_capabilities, capabilities),
          }

          remote_opts[:http_client] = opts[:http_client] if opts.has_key?(:http_client)

          super remote_opts
        end

        def browser
          :android
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::Rotatable,
            DriverExtensions::HasInputDevices,
            DriverExtensions::HasWebStorage,
            DriverExtensions::HasLocation,
            DriverExtensions::HasBrowserConnection,
            DriverExtensions::HasTouchScreen
          ]
        end

        def setScreenOrientation(orientation)
          execute :setScreenOrientation, {}, :orientation => orientation
        end

        def getScreenOrientation
          execute :getScreenOrientation
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.android
        end

      end # Bridge
    end # Android
  end # WebDriver
end # Selenium
