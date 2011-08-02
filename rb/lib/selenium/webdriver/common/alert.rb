module Selenium
  module WebDriver
    class Alert

      attr_reader :text

      def initialize(bridge)
        @bridge = bridge
        @text   = bridge.getAlertText
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

    end # Alert
  end # WebDriver
end # Selenium