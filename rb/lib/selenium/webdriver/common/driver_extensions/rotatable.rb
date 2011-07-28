module Selenium
  module WebDriver

    #
    # @api private
    #

    module DriverExtensions
      module Rotatable

        ORIENTATIONS = [:landscape, :portrait]

        #
        # Change the screen orientation
        #
        # @param [:landscape, :portrait] Orientation
        #
        # @api public
        #

        def rotate(orientation)
          unless ORIENTATIONS.include?(orientation)
            raise ArgumentError, "expected #{ORIENTATIONS.inspect}, got #{orientation.inspect}"
          end

          bridge.setScreenOrientation(orientation.to_s.upcase)
        end

        #
        # Get the current screen orientation
        #
        # @return [:landscape, :portrait] orientation
        #
        # @api public
        #

        def orientation
          bridge.getScreenOrientation.to_sym.downcase
        end

      end # Rotatable
    end # DriverExtensions
  end # WebDriver
end # Selenium
