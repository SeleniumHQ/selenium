module Selenium
  module WebDriver
    module DriverExtensions

      module HasBrowserConnection
        def online?
          @bridge.isBrowserOnline
        end

        def online=(bool)
          @bridge.setBrowserOnline bool
        end
      end

    end
  end
end
