module Selenium
  module WebDriver
    class TouchActionBuilder < ActionBuilder

      #
      # @api private
      #

      def initialize(mouse, keyboard, touch_screen)
        super(mouse, keyboard)
        @devices[:touch_screen] = touch_screen
      end

      def scroll(*args)
        unless [2,3].include? args.size
          raise ArgumentError, "wrong number of arguments, expected 2..3, got #{args.size}"
        end

        @actions << [:touch_screen, :scroll, args]
        self
      end

      def flick(*args)
        unless [2,4].include? args.size
          raise ArgumentError, "wrong number of arguments, expected 2 or 4, got #{args.size}"
        end

        @actions << [:touch_screen, :flick, args]
        self
      end

      def single_tap(element)
        @actions << [:touch_screen, :single_tap, [element]]
        self
      end

      def double_tap(element)
        @actions << [:touch_screen, :double_tap, [element]]
        self
      end

      def long_press(element)
        @actions << [:touch_screen, :long_press, [element]]
        self
      end

      def down(x, y = nil)
        @actions << [:touch_screen, :down, [x, y]]
        self
      end

      def up(x, y = nil)
        @actions << [:touch_screen, :up, [x, y]]
        self
      end

      def move(x, y = nil)
        @actions << [:touch_screen, :move, [x, y]]
        self
      end

    end
  end
end
