module Selenium
  module WebDriver

    #
    # @api private
    #

    module DriverExtensions
      module TakesScreenshot

        #
        # Save a PNG screenshot to the given path
        #
        # @api public
        #

        def save_screenshot(png_path)
          File.open(png_path, 'wb') { |f| f << screenshot_as(:png) }
        end

        #
        # Return a PNG screenshot in the given format as a string
        #
        # @param [:base64, :png] format
        # @return String screenshot
        #
        # @api public

        def screenshot_as(format)
          case format
          when :base64
            bridge.getScreenshot
          when :png
            bridge.getScreenshot.unpack("m")[0]
          else
            raise Error::UnsupportedOperationError, "unsupported format: #{format.inspect}"
          end
        end

      end # TakesScreenshot
    end # DriverExtensions
  end # WebDriver
end # Selenium
