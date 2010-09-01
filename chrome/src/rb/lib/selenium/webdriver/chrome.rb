require "selenium/webdriver/chrome/launcher"
require "selenium/webdriver/chrome/command_executor"
require "selenium/webdriver/chrome/bridge"

require "fileutils"
require "thread"
require "socket"

module Selenium
  module WebDriver

    module Chrome
      def self.path=(path)
        Launcher.binary_path = path
      end
    end

  end
end
