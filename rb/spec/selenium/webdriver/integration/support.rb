require "selenium/server"
require "selenium/webdriver/integration/support/test_environment"
require "selenium/webdriver/integration/support/jruby_test_environment"
require "selenium/webdriver/integration/support/guards"
require "selenium/webdriver/integration/support/helpers"

module Selenium
  module WebDriver
    module SpecSupport
      autoload :RackServer, "selenium/webdriver/integration/support/rack_server"
    end
  end
end