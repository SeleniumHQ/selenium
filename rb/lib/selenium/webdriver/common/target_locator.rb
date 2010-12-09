module Selenium
  module WebDriver
    class TargetLocator

      #
      # @api private
      #

      def initialize(bridge)
        @bridge = bridge
      end

      #
      # switch to the frame with the given id
      #

      def frame(id)
        @bridge.switchToFrame id
      end

      #
      # switch to the given window handle
      #
      # If given a block, this method will switch back to the original window after
      # block execution.
      #
      # @param id
      #   A window handle, obtained through Driver#window_handles
      #

      def window(id)
        if block_given?
          original = @bridge.getCurrentWindowHandle
          @bridge.switchToWindow id

          begin
            returned = yield
          ensure
            current_handles = @bridge.getWindowHandles

            if current_handles.size == 1
              original = current_handles.shift
            end

            @bridge.switchToWindow original
            returned
          end
        else
          @bridge.switchToWindow id
        end
      end

      #
      # get the active element
      #
      # @return [WebDriver::Element]
      #

      def active_element
        @bridge.switchToActiveElement
      end

      #
      # selects either the first frame on the page, or the main document when a page contains iframes.
      #

      def default_content
        @bridge.switchToDefaultContent
      end

      #
      # switches to the currently active modal dialog for this particular driver instance
      #

      def alert
        Alert.new(@bridge)
      end

    end # TargetLocator
  end # WebDriver
end  # Selenium
