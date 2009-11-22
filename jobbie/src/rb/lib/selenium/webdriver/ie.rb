module Selenium
  module WebDriver
    module IE
      # TODO: x64
      DLL = "#{WebDriver.root}/jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll"
    end
  end
end

require "ffi"

require "selenium/webdriver/ie/lib"
require "selenium/webdriver/ie/util"
require "selenium/webdriver/ie/bridge"
