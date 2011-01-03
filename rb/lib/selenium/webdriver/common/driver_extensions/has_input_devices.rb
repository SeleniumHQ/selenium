module Selenium
  module WebDriver

    #
    # @api private
    #

    module DriverExtensions
      module HasInputDevices

        def mouse
          Mouse.new @bridge
        end

        def keyboard
          Keyboard.new @bridge
        end

      end # HasInputDevices
    end # DriverExtensions
  end # WebDriver
end # Selenium
