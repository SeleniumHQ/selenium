module Selenium
  module WebDriver

    #
    # @api private
    # @see TouchActionBuilder
    #

    class TouchScreen

      def initialize(bridge)
        @bridge = bridge
      end

      def single_tap(element)
        raise NotImplementedError
      end

      def double_tap(element)
        raise NotImplementedError
      end

      def long_press(element)
        raise NotImplementedError
      end

      def flick(*args)
        raise NotImplementedError
      end

      def down(point)
        raise NotImplementedError
      end

      def up(point)
        raise NotImplementedError
      end

      def move(point)
        raise NotImplementedError
      end

      def scroll(element, right_by, down_by)
        raise NotImplementedError
      end

    end
  end
end
