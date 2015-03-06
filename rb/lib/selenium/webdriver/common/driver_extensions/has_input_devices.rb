module Selenium
  module WebDriver

    #
    # @api private
    #

    module DriverExtensions
      module HasInputDevices

        #
        # @return [ActionBuilder]
        # @api public
        #

        def action
          ActionBuilder.new mouse, keyboard
        end

        #
        # @api private
        #

        def mouse
          Mouse.new @bridge
        end

        #
        # @api private
        #

        def keyboard
          Keyboard.new @bridge
        end

      end # HasInputDevices
    end # DriverExtensions
  end # WebDriver
end # Selenium
