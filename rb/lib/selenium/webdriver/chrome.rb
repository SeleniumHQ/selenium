require 'net/http'

require 'selenium/webdriver/chrome/service'
require 'selenium/webdriver/chrome/bridge'


module Selenium
  module WebDriver

    module Chrome
      def self.path=(path)
        Service.executable_path = path
      end
    end

  end
end
