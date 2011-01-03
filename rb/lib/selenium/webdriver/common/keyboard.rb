module Selenium
  module WebDriver
    class Keyboard

      def initialize(bridge)
        raise Error::UnsupportedOperationError, "not implemented yet"
        @bridge = bridge
      end

      def send_keys(*keys)
        @bridge.getActiveElement.send_keys(*keys)
      end

      def press(key)
        @bridge.sendModifierKeyToActiveElement key, true
      end

      def release(key)
        @bridge.sendModifierKeyToActiveElement key, false
      end

    end # Keyboard
  end # WebDriver
end  # Selenium
