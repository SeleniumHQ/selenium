module Selenium
  module WebDriver
    class Element
      include Find

      attr_reader :bridge

      def initialize(bridge, id)
        @bridge, @id = bridge, id
      end

      def inspect
        '#<%s:0x%x id=%s tag_name=%s>' % [self.class, hash*2, @id.inspect, tag_name.inspect]
      end

      def click
        bridge.clickElement @id
      end

      def tag_name
        bridge.getElementTagName @id
      end

      def value
        bridge.getElementValue @id
      end

      def attribute(name)
        bridge.getElementAttribute @id, name
      end

      def text
        bridge.getElementText @id
      end

      def send_keys(*args)
        args.each do |arg|
          if arg.kind_of?(Symbol)
            arg = Keys[arg]
          end

          bridge.sendKeysToElement(@id, arg.to_s)
        end
      end
      alias_method :send_key, :send_keys

      def clear
        bridge.clearElement @id
      end

      def enabled?
        bridge.isElementEnabled @id
      end

      def selected?
        bridge.isElementSelected @id
      end

      def displayed?
        bridge.isElementDisplayed @id
      end

      def select
        bridge.setElementSelected @id
      end

      def submit
        bridge.submitElement @id
      end

      def toggle
        bridge.toggleElement @id
      end

      def style(prop)
        bridge.getElementValueOfCssProperty @id, prop
      end

      def hover
        bridge.hoverOverElement @id
      end

      def location
        bridge.getElementLocation @id
      end

      def size
        bridge.getElementSize @id
      end

      def drag_and_drop_by(right_by, down_by)
        bridge.dragElement @id, right_by, down_by
      end

      def drag_and_drop_on(other)
        current_location = location()
        destination      = other.location

        right = destination.x - current_location.x
        down  = destination.y - current_location.y

        drag_and_drop_by right, down
      end

      #-------------------------------- sugar  --------------------------------

      #
      # element.first(:id, 'foo')
      #

      alias_method :first, :find_element

      #
      # element.all(:class, 'bar')
      #

      alias_method :all, :find_elements

      #
      # element['class'] or element[:class] #=> "someclass"
      #
      alias_method :[], :attribute

      #
      # for Find and execute_script
      #

      def ref
        @id
      end



    end # Element
  end # WebDriver
end # Selenium