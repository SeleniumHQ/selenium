module Selenium
  module WebDriver
    module Android
      class Bridge < Remote::Bridge

        DEFAULT_URL = "http://localhost:8080/hub"

        def initialize(opts = nil)
          if opts
            super
          else
            super(
              :url                  => DEFAULT_URL,
              :desired_capabilities => capabilities
            )
          end
        end

        def browser
          :android
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::Rotatable
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