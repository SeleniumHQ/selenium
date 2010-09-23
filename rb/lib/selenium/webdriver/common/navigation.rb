module Selenium
  module WebDriver
    class Navigation

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Navigate to the given URL
      #

      def to(url)
        @bridge.get url
      end

      #
      # Move back a single entry in the browser's history.
      #

      def back
        @bridge.goBack
      end

      #
      # Move forward a single entry in the browser's history.
      #

      def forward
        @bridge.goForward
      end

      #
      # Refresh the current page.
      #

      def refresh
        @bridge.refresh
      end

    end # Navigation
  end # WebDriver
end # Selenium
