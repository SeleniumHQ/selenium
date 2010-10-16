require 'rubygems'
gem 'rspec', ">=1.2.8"
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/client")
require File.expand_path(File.dirname(__FILE__) + "/../../lib/selenium/rspec/spec_helper")

Spec::Runner.configure do |config|

  config.prepend_before(:each) do
    create_selenium_driver
    start_new_browser_session
  end

  config.append_after(:each) do
    begin
      selenium_driver.stop
    rescue Exception => e
      STDERR.puts "Could not properly close selenium session : #{e.inspect}"
    end
  end

  def create_selenium_driver
    application_host = ENV['SELENIUM_APPLICATION_HOST'] || "localhost"
    application_port = ENV['SELENIUM_APPLICATION_PORT'] || "4567"
    @selenium_driver = Selenium::Client::Driver.new \
        :host => (ENV['SELENIUM_RC_HOST'] || "localhost"),
        :port => (ENV['SELENIUM_RC_PORT'] || 4444),
        :browser => (ENV['SELENIUM_BROWSER'] || "*firefox"),
        :timeout_in_seconds => (ENV['SELENIUM_RC_TIMEOUT'] || 20),
        :url => "http://#{application_host}:#{application_port}"
  end
  
  def start_new_browser_session
    selenium_driver.start_new_browser_session
    selenium_driver.set_context "Starting example '#{self.description}'"
  end

  def selenium_driver
    @selenium_driver
  end
  alias :page :selenium_driver

  def should_timeout
    begin
      yield
      raise "Should have timed out"
    rescue Timeout::Error => e
      # All good
    rescue Selenium::Client::CommandError => e
      raise unless e.message =~ /ed out after/
      # All good
    end
  end

end

