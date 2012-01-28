module Selenium
  module WebDriver
    module DriverExtensions

      module HasTouchScreen
        def touch
          TouchActionBuilder.new mouse, keyboard, touch_screen
        end

        private

        def touch_screen
          TouchScreen.new @bridge
        end
      end

    end
  end
end
