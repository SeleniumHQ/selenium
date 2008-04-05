require 'rubygems'
require 'spec'
require File.expand_path(File.dirname(__FILE__) + "/../../selenium")

Spec::Runner.configure do |config|
  include SeleniumHelper

  config.before(:all) do
    remote_control_server = ENV['SELENIUM_REMOTE_CONTROL'] || "localhost"
    port = ENV['SELENIUM_PORT'] || 4444
    browser = ENV['SELENIUM_BROWSER'] || "*chrome"
    application_host = ENV['SELENIUM_APPLICATION_HOST'] || "google.com"
    application_port = ENV['SELENIUM_APPLICATION_PORT'] || "80"
    timeout = 60000    
    @selenium = Selenium::SeleniumDriver.new(remote_control_server, port, browser, "http://#{application_host}:#{application_port}", timeout)
    @selenium.start
  end

  config.after(:all) do
    @selenium.stop
  end
  
  
end

