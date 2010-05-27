module Selenium
  module WebDriver

    # @private
    module IE
      DLLS = {
        :win32 => "#{WebDriver.root}/jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll",
        :x64   => "#{WebDriver.root}/jobbie/prebuilt/x64/Release/InternetExplorerDriver.dll"
      }
    end
  end
end

require "ffi"

require "selenium/webdriver/ie/lib"
require "selenium/webdriver/ie/util"
require "selenium/webdriver/ie/bridge"
