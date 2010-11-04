require "selenium/server"
require "selenium/webdriver/support/test_environment"
require "selenium/webdriver/support/jruby_test_environment"
require "selenium/webdriver/support/guards"
require "selenium/webdriver/support/helpers"

module Selenium
  module WebDriver
    module SpecSupport
      autoload :RackServer, "selenium/webdriver/support/rack_server"
    end
  end
end