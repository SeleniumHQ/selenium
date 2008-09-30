require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "default_timeout_in_seconds returns the client driver default timeout in seconds" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url, :the_timeout
    assert_equal :the_timeout, client.default_timeout_in_seconds
  end

  test "default_timeout_in_seconds is 5 minutes by default" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    assert_equal 5 * 60, client.default_timeout_in_seconds
  end

  test "start_new_browser_session executes a getNewBrowserSession command with the browser string an url" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :the_browser, :the_url
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, ""])
    client.start_new_browser_session
	end

  test "start_new_browser_session sets the current sessionId with getNewBrowserSession response" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :the_browser, :the_url
    client.stubs(:remote_control_command)
    client.stubs(:string_command).with("getNewBrowserSession", any_parameters).returns("the new session id")
    client.start_new_browser_session
    assert_equal client.session_id, "the new session id"
	end

  test "start_new_browser_session sumbimte the javascript extension when previously defined" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :the_browser, :the_url
    client.javascript_extension = :the_javascript_extension
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension])
    client.start_new_browser_session
	end

  test "start_new_browser_session sets remote control timeout to the driver default timeout" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :the_browser, :the_url, 24
    client.stubs(:string_command).with("getNewBrowserSession", any_parameters)
    client.expects(:remote_control_timeout_in_seconds=).with(24)
    client.start_new_browser_session
	end
	
  test "session_started? returns false when no session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    assert_false client.session_started?
  end

  test "session_started? returns true when session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    client.stubs(:string_command).returns("A Session Id")
    client.stubs(:remote_control_command)
    client.start_new_browser_session    
    assert_true client.session_started?
  end

  test "session_started? returns false when session has been stopped" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    client.stubs(:string_command).returns("A Session Id")
    client.stubs(:remote_control_command)
    client.start_new_browser_session    
    client.stop
    assert_false client.session_started?
  end

  test "chrome_backend? returns true when the browser string is *firefox" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*firefox", :url
    assert_true client.chrome_backend?
  end
  
  test "chrome_backend? returns true when the browser string is *iexplore" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*iexplore", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *safari" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*safari", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *opera" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*opera", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *chrome" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*chrome", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefox2" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*firefox2", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefox3" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*firefox3", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefoxproxy" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*firefoxproxy", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *pifirefox" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, "*pifirefox", :url
    assert_false client.chrome_backend?
  end

    
end
