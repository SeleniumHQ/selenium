module Selenium
  module WebDriver
    module DriverExtensions
      module TakesScreenshot

        def save_screenshot(png_path)
          File.open(png_path, 'w') { |f| f << screenshot_as(:png) }
        end

        def screenshot_as(format)
          case format
          when :base64
            bridge.getScreenshotAsBase64
          when :png
            bridge.getScreenshotAsBase64.unpack("m")[0]
          else
            raise Error::UnsupportedOperationError, "unsupported format: #{format.inspect}"
          end
        end

      end # TakesScreenshot
    end # DriverExtensions
  end # WebDriver
end # Selenium