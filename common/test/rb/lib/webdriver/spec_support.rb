require "webdriver/spec_support/test_environment"
require "webdriver/spec_support/jruby_test_environment"
require "webdriver/spec_support/guards"
require "webdriver/spec_support/helpers"

module WebDriver
  module SpecSupport
    autoload :RackServer, "webdriver/spec_support/rack_server"
  end
end