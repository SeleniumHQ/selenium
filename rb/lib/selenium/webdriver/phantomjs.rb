require 'net/http'

require 'selenium/webdriver/phantomjs/service'
require 'selenium/webdriver/phantomjs/bridge'

module Selenium
  module WebDriver

    module PhantomJS

      def self.path=(path)
        Platform.assert_executable path
        @path = path
      end

      def self.path
        @path ||= Platform.find_binary("phantomjs")
      end

    end
  end
end
