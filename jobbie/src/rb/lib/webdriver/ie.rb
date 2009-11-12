
module WebDriver
  module IE
    # TODO: x64
    DLL = "#{WebDriver.root}/jobbie/prebuilt/Win32/Release/InternetExplorerDriver.dll"
  end
end

require "ffi"

require "webdriver/ie/lib"
require "webdriver/ie/util"
require "webdriver/ie/bridge"
