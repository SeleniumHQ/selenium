module Selenium
  module WebDriver

    # @private
    module IE
      DLLS = {
        :win32 => "#{WebDriver.root}/selenium/webdriver/ie/native/win32/InternetExplorerDriver.dll",
        :x64   => "#{WebDriver.root}/selenium/webdriver/ie/native/x64/InternetExplorerDriver.dll"
      }
    end
  end
end

require "ffi"

require "selenium/webdriver/ie/lib"
require "selenium/webdriver/ie/util"
require "selenium/webdriver/ie/bridge"
