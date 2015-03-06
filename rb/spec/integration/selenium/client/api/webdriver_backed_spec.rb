require File.expand_path(__FILE__ + '/../../spec_helper')
require 'selenium/webdriver'

describe "WebDriver-backed Selenium::Client" do
  let(:webdriver) { Selenium::WebDriver.for :remote }
  let(:selenium) {
    Selenium::Client::Driver.new :host    => test_environment.server_host,
                                 :port    => test_environment.server_port,
                                 :browser => "*webdriver",
                                 :url     => test_environment.app_url

  }
  after { selenium.stop }

  it 'can wrap an existing Selenium::WebDriver::Driver instance' do
    selenium.start :driver => webdriver

    selenium.open '/'
    selenium.title.should == webdriver.title
  end
end
