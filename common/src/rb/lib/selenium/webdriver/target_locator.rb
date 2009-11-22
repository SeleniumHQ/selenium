module Selenium
  module WebDriver
    class TargetLocator

      def initialize(driver)
        @bridge = driver.bridge
      end

      def frame(id)
        @bridge.switchToFrame id
      end

      def window(id)
        @bridge.switchToWindow id
      end

      def active_element
        @bridge.switchToActiveElement
      end

    end # TargetLocator
  end # WebDriver
end  # Selenium
