module Selenium
  module WebDriver

    # @api private
    module IE
      def self.driver_path=(path)
        Platform.assert_executable path
        @driver_path = path
      end

      def self.driver_path
        @driver_path ||= nil
      end

    end # IE
  end # WebDriver
end # Selenium

require 'selenium/webdriver/ie/server'
require 'selenium/webdriver/ie/bridge'
