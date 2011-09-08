require 'selenium/server'
require 'selenium/webdriver/opera/service'
require 'selenium/webdriver/opera/bridge'

module Selenium
  module WebDriver

    module Opera
      def self.driver_path=(path)
        Service.selenium_server_jar = path
      end

      def self.path=(path)
        Platform.assert_executable path
        @path = path
      end

      def self.path
        @path ||= nil
      end
    end

  end
end
