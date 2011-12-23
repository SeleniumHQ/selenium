module Selenium
  module WebDriver

    #
    # The ActionBuilder provides the user a way to set up and perform
    # complex user interactions.
    #
    # This class should not be instantiated directly, but is created by
    # Selenium::WebDriver::DriverExtensions::HasInputDevices#action, which
    # is available on Driver instances that support the user interaction API.
    #
    # Example:
    #
    #  driver.action.key_down(:shift).
    #                click(element).
    #                click(second_element).
    #                key_up(:shift).
    #                drag_and_drop(element, third_element).
    #                perform
    #

    class ActionBuilder

      #
      # @api private
      #

      def initialize(mouse, keyboard)
        @devices    = {
          :mouse    => mouse,
          :keyboard => keyboard
        }

        @actions  = []
      end

      #
      # Performs a modifier key press after focusing on an element or on the
      # currently focued window the entire driver instance. Does not release
      # the modifier key - subsequent interactions may assume it's kept pressed.
      # Note that the modifier key is never released implicitly - either
      # key_up(key) or send_keys(:null) must be called to release the modifier.
      # Equivalent to: ActionBuilder.click(element).send_keys(key) or
      # ActionBuilder.click.send_keys(key)
      #
      # @example Press a key on an element
      #    el = driver.find_element(:id, "some_id")
      #    driver.action.key_down(el, :shift).perform
      #
      # @example Press a key
      #    driver.action.key_down(:control).perform
      #
      # @param key Either :shift, :alt, :control, :command or :meta. If the
      #   provided key is none of those, ArgumentError is thrown.
      # @param element A Selenium::WebDriver::Element
      # @return A self reference.
      #

      def key_down(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :press, args]
        self
      end

      #
      # Performs a modifier key release after focusing on an element. Equivalent
      # to: ActionBuilder.click(element).send_keys(key) or
      # ActionBuilder.action.click.send_keys(key)
      #
      # @example Release a key from an element
      #   el = driver.find_element(:id, "some_id")
      #   driver.action.key_up(el, :alt).perform
      #
      # @example Release a key
      #   driver.action.key_up(:shift).perform
      #
      # @param key :shift, :alt, :control, :command, or :meta.
      # @param element A Selenium::WebDriver::Element
      # @return A self reference.
      #

      def key_up(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :release, args]
        self
      end

      #
      # Sends keys to the active element. This differs from calling
      # Selenium::WebDriver::Element.send_keys(keys) on the active element in
      # two ways:
      #
      # The modifier keys included in this call are not released.
      # There is no attempt to re-focus the element - so send_keys(:tab) for
      # switching elements should work.
      #
      # @example Send the text "help" to an element
      #   el = driver.find_element(:id, "some_id")
      #   driver.action.send_keys(el, "help").perform
      #
      # @example Send the text "help"
      #   driver.action.send_keys("help").perform
      #
      # @param element A Selenium::WebDriver::Element
      # @param keys The keys to be sent.
      # @return A self reference.
      #

      def send_keys(*args)
        if args.first.kind_of? Element
          @actions << [:mouse, :click, [args.shift]]
        end

        @actions << [:keyboard, :send_keys, args]
        self
      end

      #
      # Clicks (without releasing) in the middle of the given element. This is
      # equivalent to:
      # ActionBuilder.move_to(Selenium::WebDriver::Element).click_and_hold()
      #
      # @example Clicking and holding on some element
      #    el = driver.find_element(:id, "some_id")
      #    driver.action.click_and_hold(el).perform
      #
      # @param element the Selenium::Webdriver::Element to move to and click.
      # @return A self reference.
      #

      def click_and_hold(element)
        @actions << [:mouse, :down, [element]]
        self
      end

      #
      # Releases the depressed left mouse button at the current mouse location.
      #
      # @example Releasing an element after clicking and holding it
      #    el = driver.find_element(:id, "some_id")
      #    driver.action.click_and_hold(el).release.perform
      # @return A self reference.
      #

      def release(element = nil)
        @actions << [:mouse, :up, [element]]
        self
      end

      #
      # Clicks in the middle of the given element. Equivalent to:
      # ActionBuilder.move_to(Selenium::WebDriver::Element).click
      # Also able to be clicked on the current mouse location
      #
      # @example Clicking on an element
      #    el = driver.find_element(:id, "some_id")
      #    driver.action.click(el).perform
      #
      # @example Clicking at the current mouse position
      #    driver.action.click.perform
      #
      # @param element Selenium::Webdriver::Element to click.
      # @return A self reference.
      #

      def click(element = nil)
        @actions << [:mouse, :click, [element]]
        self
      end

      #
      # Performs a double-click at middle of the given element. Equivalent to:
      # ActionBuilder.move_to(Selenium::Webdriver::Element).double_click
      #
      # @example Click on an element
      #    el = driver.find_element(:id, "some_id")
      #    driver.action.double_click(el).perform
      # @param element Selenium::WebDriver::Element to move to.
      # @return A self reference.
      #

      def double_click(element = nil)
        @actions << [:mouse, :double_click, [element]]
        self
      end

      #
      # Moves the mouse to the middle of the element. The element is scrolled into
      # view and its location is calculated using getBoundingClientRect.  Then the
      # move is moved to optional offset coordinates from the element.
      #
      #
      # @example Scroll element into view and click it
      #   el = driver.find_element(:id, "some_id")
      #   driver.action.move_to(el).perform
      #
      # @example
      #   el = driver.find_element(:id, "some_id")
      #   driver.action.move_to(el, 100, 100).perform
      #
      # @param element Selenium::WebDriver::Element to move to.
      # @param right_by Offset from the top-left corner. A negative value means
      #   coordinates right from the element.
      # @param down_by Offset from the top-left corner. A negative value means
      #   coordinates above the element.
      # @return A self reference.
      #

      def move_to(element, right_by = nil, down_by = nil)
        if right_by && down_by
          @actions << [:mouse, :move_to, [element, right_by, down_by]]
        else
          @actions << [:mouse, :move_to, [element]]
        end

        self
      end

      #
      # Moves the mouse from its current position (or 0,0) by the given offset.
      # If the coordinates provided are outside the viewport (the mouse will
      # end up outside the browser window) then the viewport is scrolled to
      # match.
      #
      # @example Move the mouse to a certain offset from its current position
      #    driver.action.move_by(100, 100).perform
      #
      # @param right_by horizontal offset. A negative value means moving the
      #   mouse left.
      # @param down_by vertical offset. A negative value means moving the mouse
      #   up.
      # @return A self reference.
      # @throws MoveTargetOutOfBoundsError if the provided offset is outside
      #   the document's boundaries.
      #

      def move_by(right_by, down_by)
        @actions << [:mouse, :move_by, [right_by, down_by]]
        self
      end

      #
      # Performs a context-click at middle of the given element. First performs
      # a mouseMove to the location of the element.
      #
      # @example Context-click at middle of given element
      #   el = driver.find_element(:id, "some_id")
      #    driver.action.context_click(el).perform
      #
      # @param element Selenium:WebDriver::Element to move to.
      # @return A self reference.
      #

      def context_click(element = nil)
        @actions << [:mouse, :context_click, [element]]
        self
      end

      #
      # A convenience method that performs click-and-hold at the location of the
      # source element, moves to the location of the target element, then
      # releases the mouse.
      #
      # @example Drag and drop one element onto another
      #   el1 = driver.find_element(:id, "some_id1")
      #   el2 = driver.find_element(:id, "some_id2")
      #   driver.action.drag_and_drop(el1, el2).perform
      #
      # @param source Selenium::WebDriver::Element to emulate button down at.
      # @param target Selenium::WebDriver::Element to move to and release the
      #   mouse at.
      # @return A self reference.
      #

      def drag_and_drop(source, target)
        click_and_hold source
        move_to        target
        release        target

        self
      end

      #
      # A convenience method that performs click-and-hold at the location of
      # the source element, moves by a given offset, then releases the mouse.
      #
      # @example Drag and drop one element onto another
      #   el = driver.find_element(:id, "some_id1")
      #   driver.action.drag_and_drop(el, 100, 100).perform
      #
      # @param source Selenium::WebDriver::Element to emulate button down at.
      # @param right_by horizontal move offset.
      # @param down_by vertical move offset.
      # @param target Selenium::WebDriver::Element to move to and release the
      #   mouse at.
      # @return A self reference.
      #

      def drag_and_drop_by(source, right_by, down_by)
        click_and_hold source
        move_by        right_by, down_by
        release

        self
      end


      #
      # A convenience method for performing the actions described herein
      #

      def perform
        @actions.each { |receiver, method, args|
          @devices.fetch(receiver).__send__(method, *args)
        }
      end

    end # ActionBuilder
  end # WebDriver
end # Selenium
