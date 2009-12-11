module Selenium
  module WebDriver
    class TargetLocator

      #
      # @api private
      #

      def initialize(driver)
        @bridge = driver.bridge
      end

      #
      # switch to the frame with the given id
      #

      def frame(id)
        @bridge.switchToFrame id
      end

      #
      # switch to the frame with the given id
      #

      def window(id)
        @bridge.switchToWindow id
      end

      #
      # get the active element
      #
      # @return [WebDriver::Element]
      #

      def active_element
        @bridge.switchToActiveElement
      end

    end # TargetLocator
  end # WebDriver
end  # Selenium
