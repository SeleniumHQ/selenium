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
        @bridge.setImplicitWaitTimeout Integer(seconds * 1000)
      end

      #
      # Sets the amount of time to wait for an asynchronous script to finish
      # execution before throwing an error. If the timeout is negative, then the
      # script will be allowed to run indefinitely.
      #

      def script_timeout=(seconds)
        @bridge.setScriptTimeout Integer(seconds * 1000)
      end

    end # Timeouts
  end # WebDriver
end # Selenium