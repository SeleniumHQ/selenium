module Selenium
  module WebDriver
    class Mouse

      def initialize(bridge)
        @bridge = bridge
      end

      def click(element)
        @bridge.clickElement element.ref
      end

      def double_click(element)
        @bridge.doubleClickElement element.ref
      end

      def context_click(element)
        @bridge.contextClickElement element.ref
      end

      def down(element)
        @bridge.mouseDownElement element.ref
      end

      def up(element)
        @bridge.mouseUpElement element.ref
      end

      def move(element, x_offset = nil, y_offset = nil)
        @bridge.mouseMoveToElement element.ref,
                                   x_offset, y_offset
      end

    end # Mouse
  end # WebDriver
end  # Selenium
