require 'rubygems'
require 'time'
require 'rspec'
require 'ci/reporter/rspec'

require 'selenium-webdriver'
require 'selenium/webdriver/spec_support'

include Selenium

if WebDriver::Platform.jruby?
  require 'java'

  [
    Dir['build/**/*.jar'],
    Dir['third_party/java/servlet-api/*.jar'],
    'third_party/java/jetty/jetty-repacked-7.6.1.jar',
  ].flatten.each { |jar| require jar }


  GlobalTestEnv = WebDriver::SpecSupport::JRubyTestEnvironment.new
else
  GlobalTestEnv = WebDriver::SpecSupport::TestEnvironment.new
end

class Object
  include WebDriver::SpecSupport::Guards
end

RSpec.configure do |c|
  c.include(WebDriver::SpecSupport::Helpers)
  c.before(:suite) do
    if GlobalTestEnv.driver == :remote
      GlobalTestEnv.remote_server.start
    end
  end

  c.after(:suite) do
    GlobalTestEnv.quit_driver
  end

  c.filter_run :focus => true if ENV['focus']
end

WebDriver::Platform.exit_hook { GlobalTestEnv.quit }

$stdout.sync = true
GlobalTestEnv.unguarded = !!ENV['noguards']