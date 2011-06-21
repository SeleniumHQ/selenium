module Selenium
  module WebDriver
    class ActionBuilder

      def initialize(mouse, keyboard)
        @devices    = {
          :mouse    => mouse,
          :keyboard => keyboard
        }

        @actions  = []
      end

      def key_down(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :press, args]
        self
      end

      def key_up(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :release, args]
        self
      end

      def send_keys(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :send_keys, args]
        self
      end

      def click_and_hold(element)
        @actions << [:mouse, :down, [element]]
        self
      end

      def release(element = nil)
        @actions << [:mouse, :up, [element]]
        self
      end

      def click(element = nil)
        @actions << [:mouse, :click, [element]]
        self
      end

      def double_click(element = nil)
        @actions << [:mouse, :double_click, [element]]
        self
      end

      def move_to(element, down_by = nil, right_by = nil)
        if down_by && right_by
          @actions << [:mouse, :move_to, [element, down_by, right_by]]
        else
          @actions << [:mouse, :move_to, [element]]
        end

        self
      end

      def move_by(down_by, right_by)
        @actions << [:mouse, :move_by, [down_by, right_by]]
        self
      end

      def context_click(element = nil)
        @actions << [:mouse, :context_click, [element]]
        self
      end

      def drag_and_drop(source, target)
        click_and_hold source
        move_to        target
        release        target

        self
      end

      def drag_and_drop_by(source, down_by, right_by)
        click_and_hold source
        move_by        down_by, right_by
        release

        self
      end

      def perform
        @actions.each { |receiver, method, args|
          @devices.fetch(receiver).__send__(method, *args)
        }
      end

    end # ActionBuilder
  end # WebDriver
end # Selenium
