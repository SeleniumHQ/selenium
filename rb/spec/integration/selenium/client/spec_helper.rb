require 'rubygems'
require 'selenium/client'
require 'tmpdir'
require File.expand_path('../sample-app/sample_app', __FILE__)

# for bamboo
require 'ci/reporter/rspec'

class SeleniumClientTestEnvironment
  def initialize
    $stdout.sync = true
    @jar = File.expand_path("../../../../../../build/java/server/test/org/openqa/selenium/server-with-tests-standalone.jar", __FILE__)

    raise Errno::ENOENT, @jar unless File.exist?(@jar)
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

  def driver
    @driver ||= new_driver_with_session
  end

  def in_separate_driver
    @driver.stop if @driver
    begin
      @driver = new_driver_with_session
      yield
    ensure
      @driver.stop
      @driver = new_driver_with_session
    end
  end

  def server_host
    ENV['SELENIUM_RC_HOST'] || "localhost"
  end

  def server_port
    ENV['SELENIUM_RC_PORT'] || 4444
  end

  def app_url
    application_host = ENV['SELENIUM_APPLICATION_HOST'] || "localhost"
    application_port = ENV['SELENIUM_APPLICATION_PORT'] || "4567"

    "http://#{application_host}:#{application_port}"
  end

  private

  def new_driver_with_session
    driver = Selenium::Client::Driver.new :host               => server_host,
                                          :port               => server_port,
                                          :browser            => (ENV['SELENIUM_BROWSER'] || "*firefox"),
                                          :timeout_in_seconds => (ENV['SELENIUM_RC_TIMEOUT'] || 20),
                                          :url                => app_url

    driver.start_new_browser_session
    driver.set_context self.class.name

    driver
  end

  def start_server
    @server = Selenium::Server.new(@jar, :background => true,
                                         :timeout    => 3*60,
                                         :port       => server_port,
                                         :log        => true)

    @server << "-singleWindow"
    @server.start
  end

  def stop_server
    @server && @server.stop
  end

  def start_example_app
    Thread.abort_on_exception = true
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


RSpec.configure do |config|
  if ENV['focus']
    config.filter_run :focus => true
  end

  config.after(:suite) do
    $selenium_client_test_environment && $selenium_client_test_environment.stop
  end

  def selenium_driver
    test_environment.driver
  end
  alias :page :selenium_driver

  def test_environment
    $selenium_client_test_environment ||= SeleniumClientTestEnvironment.new.run
  end

  def in_separate_driver(&blk)
    test_environment.in_separate_driver(&blk)
  end

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

