require 'timeout'
require 'socket'
require 'rexml/document'

require 'selenium/webdriver/firefox/util'
require 'selenium/webdriver/firefox/extension'
require 'selenium/webdriver/firefox/socket_lock'
require 'selenium/webdriver/firefox/binary'
require 'selenium/webdriver/firefox/profiles_ini'
require 'selenium/webdriver/firefox/profile'
require 'selenium/webdriver/firefox/launcher'
require 'selenium/webdriver/firefox/bridge'

module Selenium
  module WebDriver
    module Firefox

      DEFAULT_PORT                    = 7055
      DEFAULT_ENABLE_NATIVE_EVENTS    = Platform.os == :windows
      DEFAULT_SECURE_SSL              = false
      DEFAULT_ASSUME_UNTRUSTED_ISSUER = true
      DEFAULT_LOAD_NO_FOCUS_LIB       = false

      def self.path=(path)
        Binary.path = path
      end

    end
  end
end


# SocketError was added in Ruby 1.8.7.
# If it's not defined, we add it here so it can be used in rescues.
unless defined? SocketError
  class SocketError < IOError; end
end
