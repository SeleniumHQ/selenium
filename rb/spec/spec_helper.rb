require "spec"
require "selenium-webdriver"
require "selenium/webdriver/support/remote_server"
require "selenium/webdriver/support/test_environment"
require "selenium/webdriver/support/jruby_test_environment"
require "selenium/webdriver/support/guards"
require "selenium/webdriver/support/helpers"

module Selenium
  module WebDriver
    module SpecSupport
      autoload :RackServer, "selenium/webdriver/spec_support/rack_server"
    end
  end
end

include Selenium

if WebDriver::Platform.jruby?
  require "java"

  [
    Dir["build/**/*.jar"],
    Dir["third_party/java/{jetty,servlet-api}/*.jar"]
  ].flatten.each { |jar| require jar }


  GlobalTestEnv = WebDriver::SpecSupport::JRubyTestEnvironment.new
else
  GlobalTestEnv = WebDriver::SpecSupport::TestEnvironment.new
end

class Object
  include WebDriver::SpecSupport::Guards
end

Spec::Runner.configure do |c|
  c.include(WebDriver::SpecSupport::Helpers)
  c.before(:suite) do
    if GlobalTestEnv.driver == :remote
      GlobalTestEnv.remote_server.start
    end
  end

  c.after(:suite) do
    GlobalTestEnv.driver_instance.quit
  end
end

at_exit { GlobalTestEnv.quit }

$stdout.sync = true
