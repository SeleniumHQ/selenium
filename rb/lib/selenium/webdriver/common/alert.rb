module Selenium
  module WebDriver
    class Alert

      def initialize(bridge)
        @bridge = bridge

        # fail fast if the alert doesn't exist
        bridge.getAlertText
      end

      def accept
        @bridge.acceptAlert
      end

      def dismiss
        @bridge.dismissAlert
      end

      def send_keys(keys)
        @bridge.setAlertValue keys
      end

      def text
        @bridge.getAlertText
      end

    end # Alert
  end # WebDriver
end # Selenium