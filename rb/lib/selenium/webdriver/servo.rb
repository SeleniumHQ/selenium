require 'selenium/webdriver/servo/service'
require 'selenium/webdriver/servo/driver'

module Selenium
  module WebDriver
    module Servo
      def self.driver_path=(path)
        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path
        @driver_path ||= nil
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
