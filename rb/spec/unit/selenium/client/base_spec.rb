require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Base do

  class BaseClient
    include Selenium::Client::Base
  end

  describe "#initialize with hash" do
    it "sets the host" do
      client = BaseClient.new :host => "the.host.com"
      client.host.should == "the.host.com"
    end

    it "sets the port" do
      client = BaseClient.new :port => 4000
      client.port.should == 4000
    end

    it "sets the port as a string" do
      client = BaseClient.new :port => "4000"
      client.port.should == 4000
    end

    it "sets the browser string" do
      client = BaseClient.new :browser => "*safari"
      client.browser_string.should == "*safari"
    end

    it "sets the browser url" do
      client = BaseClient.new :url => "http://ph7spot.com"
      client.browser_url.should == "http://ph7spot.com"
    end

    it "sets the default timeout" do
      client = BaseClient.new :timeout_in_seconds => 24
      client.default_timeout_in_seconds.should == 24
    end

    it "sets the default javascript framework " do
      client = BaseClient.new :javascript_framework => :jquery
      client.default_javascript_framework.should == :jquery
    end

    it "sets the default javascript framework to prototype when not explicitely set" do
      BaseClient.new.default_javascript_framework.should == :prototype
    end

    it "sets highlight_located_element_by_default" do
      client = BaseClient.new :highlight_located_element => true

      client.highlight_located_element_by_default.should be_true
    end

    it "sets highlight_located_element_by_default to false by default" do
      client = BaseClient.new :host => :a_host
      client.highlight_located_element_by_default.should be_false
    end
  end

  describe "#initialize" do
    it "sets the default timeout to 5 minutes when not explicitely set" do
      BaseClient.new.default_timeout_in_seconds.should == 5 * 60
    end

    it "sets default_timeout_in_seconds to the client driver default timeout in seconds" do
      client = BaseClient.new :host, 1234, :browser, :url, 24
      client.default_timeout_in_seconds.should == 24
    end

    it "sets default_timeout_in_seconds to 5 minutes by default" do
      client = BaseClient.new :host, 24, :browser, :url
      client.default_timeout_in_seconds.should == 5 * 60
    end

    it "sets highlight_located_element_by_default to false by default" do
      BaseClient.new.highlight_located_element_by_default.should be_false
    end
  end

  describe "#start_new_browser_session" do
    it "executes a getNewBrowserSession command with the browser string an url" do
      client = BaseClient.new :host, 24, :the_browser, :the_url

      client.stub!(:remote_control_command)
      client.should_receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, "", ""])

      client.start_new_browser_session
    end

    it "submits the javascript extension when previously defined" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      client.stub!(:remote_control_command)
      client.should_receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, ""])

      client.start_new_browser_session
    end

    it "submits an option when provided" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      client.stub!(:remote_control_command)
      client.should_receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true"])

      client.start_new_browser_session(:captureNetworkTraffic => true)
    end

    it "submits multiple options when provided" do
      client = BaseClient.new :host, 24, :the_browser, :the_url
      client.javascript_extension = :the_javascript_extension

      client.stub!(:remote_control_command)
      client.should_receive(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true;quack=false"])

      client.start_new_browser_session(:captureNetworkTraffic => true, :quack => false)
    end

    it "sets the current sessionId with getNewBrowserSession response" do
      client = BaseClient.new :host, 24, :the_browser, :the_url

      client.stub!(:remote_control_command)
      client.should_receive(:string_command).with("getNewBrowserSession", instance_of(Array)).
        and_return("the new session id")

      client.start_new_browser_session

      client.session_id.should == "the new session id"
    end

    it "sets remote control timeout to the driver default timeout" do
      client = BaseClient.new :host, 24, :the_browser, :the_url, 24

      client.should_receive(:string_command).with("getNewBrowserSession", instance_of(Array))
      client.should_receive(:remote_control_timeout_in_seconds=).with(24)

      client.start_new_browser_session
    end

    it "sets up auto-higlight of located element when option is set" do
      client = BaseClient.new :highlight_located_element => true

      client.stub!(:remote_control_command)
      client.should_receive(:highlight_located_element=).with(true)

      client.start_new_browser_session
    end

    it "does not set up auto-higlight of located element when option is not set" do
      client = BaseClient.new :highlight_located_element => false

      client.stub!(:remote_control_command)
      client.should_not_receive(:highlight_located_element=)

      client.start_new_browser_session
    end
  end

  describe "session_started?" do
    it "returns false when no session has been started" do
      client = BaseClient.new :host, 24, :browser, :url
      client.session_started?.should be_false
    end

    it "returns true when session has been started" do
      client = BaseClient.new :host, 24, :browser, :url

      client.stub!(:string_command).and_return("A Session Id")
      client.stub!(:remote_control_command)

      client.start_new_browser_session

      client.session_started?.should be_true
    end

    it "returns false when session has been stopped" do
      client = BaseClient.new :host, 24, :browser, :url

      client.stub!(:string_command).and_return("A Session Id")
      client.stub!(:remote_control_command)

      client.start_new_browser_session
      client.stop

      client.session_started?.should be_false
    end
  end

  describe "chrome_backend?" do
    it "returns true when the browser string is *firefox" do
      client = BaseClient.new :host, 24, "*firefox", :url
      client.chrome_backend?.should be_true
    end

    it "returns false when the browser string is *iexplore" do
      client = BaseClient.new :host, 24, "*iexplore", :url
      client.chrome_backend?.should be_false
    end

    it "returns false when the browser string is *safari" do
      client = BaseClient.new :host, 24, "*safari", :url
      client.chrome_backend?.should be_false
    end

    it "returns false when the browser string is *opera" do
      client = BaseClient.new :host, 24, "*opera", :url
      client.chrome_backend?.should be_false
    end

    it "returns true when the browser string is *chrome" do
      client = BaseClient.new :host, 24, "*chrome", :url
      client.chrome_backend?.should be_true
    end

    it "returns true when the browser string is *firefox2" do
      client = BaseClient.new :host, 24, "*firefox2", :url
      client.chrome_backend?.should be_true
    end

    it "returns true when the browser string is *firefox3" do
      client = BaseClient.new :host, 24, "*firefox3", :url
      client.chrome_backend?.should be_true
    end

    it "returns false when the browser string is *firefoxproxy" do
      client = BaseClient.new :host, 24, "*firefoxproxy", :url
      client.chrome_backend?.should be_false
    end

    it "returns false when the browser string is *pifirefox" do
      client = BaseClient.new :host, 24, "*pifirefox", :url
      client.chrome_backend?.should be_false
    end
  end


end
