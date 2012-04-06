require 'rubygems'
require 'time'
require 'rspec'
require 'ci/reporter/rspec'

require 'selenium-webdriver'
require 'selenium/webdriver/spec_support'

include Selenium

GlobalTestEnv = WebDriver::SpecSupport::TestEnvironment.new

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