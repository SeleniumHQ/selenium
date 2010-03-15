module Selenium
  module WebDriver

    #
    # @private
    #

    module DriverExtensions
      module TakesScreenshot

        def save_screenshot(png_path)
          File.open(png_path, 'w') { |f| f << screenshot_as(:png) }
        end

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