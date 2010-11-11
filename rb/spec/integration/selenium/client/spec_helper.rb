require 'rubygems'
require "selenium/client"
require "base64"
require "tmpdir"
require File.expand_path("../sample-app/sample_app", __FILE__)

# for bamboo
require "ci/reporter/rspec"
ENV['CI_REPORTS'] = "build/test_logs"

class SeleniumClientTestEnvironment
  def initialize
    Thread.abort_on_exception = true
    $stdout.sync              = true

    @jar = File.expand_path("../../../../../../build/selenium/server-with-tests-standalone.jar", __FILE__)
    raise Errno::ENOENT, jar unless File.exist?(@jar)
  end

  def run
    start_server
    start_example_app

    self
  end

  def stop
    stop_example_app
    stop_server
  end

  private

  def start_server
    @server = Selenium::Server.new(@jar, :background => true,
                                         :timeout    => 3*60,
                                         :port       => 4444,
                                         :log        => true)

    @server << "-singleWindow"
    @server.start
  end

  def stop_server
    @server && @server.stop
  end

  def start_example_app
    @example_app = Thread.new { SampleApp.start("127.0.0.1", 4567) }

    poller = Selenium::WebDriver::SocketPoller.new("127.0.0.1", 4567, 60)
    unless poller.connected?
      raise "timed out waiting for SampleApp to launch"
    end
  end

  def stop_example_app
    @example_app.kill
  end
end # SeleniumClientTestEnvironment


Spec::Runner.configure do |config|

  config.before(:suite) do
    @test_environment = SeleniumClientTestEnvironment.new.run
  end

  config.after(:suite) do
    @test_environment.stop if @test_environment
  end

  config.prepend_before(:each) do
    create_selenium_driver
    start_new_browser_session
  end

  config.prepend_after(:each) do
    begin
      selenium_driver.stop
    rescue StandardError => e
      $stderr.puts "Could not properly close selenium session : #{e.inspect}"
      raise e
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

