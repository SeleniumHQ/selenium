module Selenium
  module WebDriver

    #
    # @api private
    # @see ActionBuilder
    #

    class Mouse

      def initialize(bridge)
        @bridge = bridge
      end

      def click(element = nil)
        move_if_needed element
        @bridge.click
      end

      def double_click(element = nil)
        move_if_needed element
        @bridge.doubleClick
      end

      def context_click(element = nil)
        move_if_needed element
        @bridge.contextClick
      end

      def down(element = nil)
        move_if_needed element
        @bridge.mouseDown
      end

      def up(element = nil)
        move_if_needed element
        @bridge.mouseUp
      end

      #
      # Move the mouse.
      #
      # Examples:
      #
      #   driver.mouse.move_to(element)
      #   driver.mouse.move_to(element, 5, 5)
      #

      def move_to(element, right_by = nil, down_by = nil)
        unless element.kind_of? Element
          raise TypeError, "expected #{Element}, got #{element.inspect}:#{element.class}"
        end

        @bridge.mouseMoveTo element.ref, right_by, down_by
      end

      def move_by(right_by, down_by)
        @bridge.mouseMoveTo nil, right_by, down_by
      end

      private

      def move_if_needed(element)
        move_to element if element
      end

    end # Mouse
  end # WebDriver
end  # Selenium
