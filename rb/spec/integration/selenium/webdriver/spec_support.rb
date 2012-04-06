require 'selenium/server'
require 'selenium/webdriver/spec_support/test_environment'
require 'selenium/webdriver/spec_support/guards'
require 'selenium/webdriver/spec_support/helpers'

module Selenium
  module WebDriver
    module SpecSupport
      autoload :RackServer, 'selenium/webdriver/spec_support/rack_server'
    end
  end
end