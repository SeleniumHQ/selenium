module Selenium
  module WebDriver

    #
    # @api private
    # @see ActionBuilder

    class Keyboard

      def initialize(bridge)
        @bridge = bridge
      end

      def send_keys(*keys)
        @bridge.sendKeysToActiveElement Keys.encode(keys)
      end

      #
      # Press a modifier key
      #
      # @see Selenium::WebDriver::Keys
      #

      def press(key)
        assert_modifier key

        @bridge.sendKeysToActiveElement Keys.encode([key])
      end

      #
      # Release a modifier key
      #
      # @see Selenium::WebDriver::Keys
      #

      def release(key)
        assert_modifier key

        @bridge.sendKeysToActiveElement Keys.encode([key])
      end

      private

      MODIFIERS = [:control, :shift, :alt, :command, :meta]

      def assert_modifier(key)
        unless MODIFIERS.include? key
          raise ArgumentError,
            "#{key.inspect} is not a modifier key, expected one of #{MODIFIERS.inspect}"
        end
      end

    end # Keyboard
  end # WebDriver
end  # Selenium
