module Selenium
  module WebDriver
    class Timeouts

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # Set the amount of time the driver should wait when searching for elements.
      #

      def implicit_wait=(seconds)
        @bridge.setImplicitWaitTimeout seconds * 1000
      end

    end # Timeouts
  end # WebDriver
end # Selenium