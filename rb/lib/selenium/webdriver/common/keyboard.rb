module Selenium
  module WebDriver

    # @api private
    class Keyboard

      def initialize(bridge)
        @bridge = bridge
      end

      def send_keys(*keys)
        @bridge.getActiveElement.send_keys(*keys)
      end

      #
      # Release a modifier key
      #
      # @see Selenium::WebDriver::Keys
      #

      def press(key)
        assert_modifier key
        @bridge.sendModifierKeyToActiveElement Keys[key], true
      end

      #
      # Release a modifier key
      #
      # @see Selenium::WebDriver::Keys
      #

      def release(key)
        assert_modifier key
        @bridge.sendModifierKeyToActiveElement Keys[key], false
      end

      private

      MODIFIERS = [:control, :shift, :alt, :command, :meta]

      def assert_modifier(key)
        unless MODIFIERS.include? key
          raise Error::UnsupportedOperationError,
            "#{key.inspect} is not a modifier key, expected one of #{MODIFIERS.inspect}"
        end
      end

    end # Keyboard
  end # WebDriver
end  # Selenium
