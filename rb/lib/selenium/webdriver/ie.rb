module Selenium
  module WebDriver

    # @api private
    module IE
      DLLS = {
        :win32 => "#{WebDriver.root}/selenium/webdriver/ie/native/win32/IEDriver.dll",
        :x64   => "#{WebDriver.root}/selenium/webdriver/ie/native/x64/IEDriver.dll"
      }

      DLLS.each { |k,v| DLLS[k] = Platform.cygwin_path(v, :dos => true) } if Platform.cygwin?
    end
  end
end

require 'ffi'

require 'selenium/webdriver/ie/server'
require 'selenium/webdriver/ie/bridge'
