require "timeout"
require "socket"

require "webdriver/firefox/util"
require "webdriver/firefox/binary"
require "webdriver/firefox/profiles_ini"
require "webdriver/firefox/profile"
require "webdriver/firefox/extension_connection"
require "webdriver/firefox/launcher"
require "webdriver/firefox/bridge"

module WebDriver
  module Firefox
    
     DEFAULT_PROFILE_NAME = "WebDriver".freeze
     DEFAULT_PORT         = 7055
    
  end
end