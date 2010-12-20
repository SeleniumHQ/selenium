module Selenium
  module WebDriver

    # @api private
    module IE
      DLLS = {
        :win32 => "#{WebDriver.root}/selenium/webdriver/ie/native/win32/IEDriver.dll",
        :x64   => "#{WebDriver.root}/selenium/webdriver/ie/native/x64/IEDriver.dll"
      }
    end
  end
end

require "ffi"

require "selenium/webdriver/ie/lib"
require "selenium/webdriver/ie/bridge"
