module Selenium
  module WebDriver
    class Navigation

      def initialize(driver)
        @driver = driver
      end

      def to(url)
        @driver.bridge.get url
      end

      def back
        @driver.bridge.goBack
      end

      def forward
        @driver.bridge.goForward
      end

    end # Navigation
  end # WebDriver
end # Selenium