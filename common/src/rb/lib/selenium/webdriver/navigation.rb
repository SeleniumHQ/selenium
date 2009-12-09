module Selenium
  module WebDriver
    class Navigation

      def initialize(driver)
        @bridge = driver.bridge
      end

      def to(url)
        @bridge.get url
      end

      def back
        @bridge.goBack
      end

      def forward
        @bridge.goForward
      end

      def refresh
        @bridge.refresh
      end

    end # Navigation
  end # WebDriver
end # Selenium