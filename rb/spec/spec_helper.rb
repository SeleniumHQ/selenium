# Bundler on jruby-complete.jar is blocked on http://jira.codehaus.org/browse/JRUBY-5006
if RUBY_PLATFORM != "java"
  require 'bundler/setup'
end

require "spec"

# for bamboo
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

require "selenium-webdriver"
require "selenium/webdriver/support"

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
    GlobalTestEnv.quit_driver
  end
end

at_exit { GlobalTestEnv.quit }

$stdout.sync = true
