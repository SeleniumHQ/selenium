require 'rubygems'
gem "rspec", ">=1.2.8"
require 'spec'
require File.expand_path(File.dirname(__FILE__) + "/../../../../lib/selenium/client")
require File.expand_path(File.dirname(__FILE__) + "/../../../../lib/selenium/rspec/spec_helper")

Spec::Runner.configure do |config|

  # The system capture need to happen BEFORE closing the Selenium session 
  config.append_after(:each) do    
    @selenium_driver.close_current_browser_session
  end

  def create_selenium_driver(options = {})
    remote_control_server = options[:host] || ENV['SELENIUM_REMOTE_CONTROL'] || "localhost"
    port = options[:port] || ENV['SELENIUM_PORT'] || 4444
    browser = options[:browser] || ENV['SELENIUM_BROWSER'] || "*firefox"
    application_host = options[:application_host] || ENV['SELENIUM_APPLICATION_HOST'] || "localhost"
    application_port = options[:application_port] || ENV['SELENIUM_APPLICATION_PORT'] || "4444"
    timeout = options[:timeout] || 60
    @selenium_driver = Selenium::Client::Driver.new(remote_control_server, port, browser, "http://#{application_host}:#{application_port}", timeout)
  end

  def start_new_browser_session
    @selenium_driver.start_new_browser_session
    @selenium_driver.set_context "Starting example '#{self.description}'"
  end
  
  def selenium_driver
    @selenium_driver
  end
    
  def page
    @selenium_driver
  end
  
end

