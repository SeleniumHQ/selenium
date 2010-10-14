require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "Hash initializer sets the host" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :host => "the.host.com"
    assert_equal "the.host.com", client.host
  end

  test "Hash initializer sets the port" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :port => 4000
    assert_equal 4000, client.port
  end

  test "Hash initializer port can be specified as a string" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :port => "4000"
    assert_equal 4000, client.port
  end

  test "Hash initializer sets the browser string" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :browser => "*safari"
    assert_equal "*safari", client.browser_string
  end

  test "Hash initializer sets the browser url" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :url => "http://ph7spot.com"
    assert_equal "http://ph7spot.com", client.browser_url
  end

  test "Hash initializer sets the default timeout" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :timeout_in_seconds => 24
    assert_equal 24, client.default_timeout_in_seconds
  end

  test "Hash initializer sets the default timeout to 5 minutes when not explicitely set" do
    client = Class.new { include Selenium::Client::Base }.new
    assert_equal 5 * 60, client.default_timeout_in_seconds
  end

  test "Hash initializer sets the default javascript framework " do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :javascript_framework => :jquery
    assert_equal :jquery, client.default_javascript_framework
  end

  test "Hash initializer sets the default javascript framework to prototype when not explicitely set" do
    client = Class.new { include Selenium::Client::Base }.new
    assert_equal :prototype, client.default_javascript_framework
  end

  test "default_timeout_in_seconds returns the client driver default timeout in seconds" do
    client = Class.new { include Selenium::Client::Base }.new :host, 1234, :browser, :url, 24
    assert_equal 24, client.default_timeout_in_seconds
  end

  test "default_timeout_in_seconds is 5 minutes by default" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :browser, :url
    assert_equal 5 * 60, client.default_timeout_in_seconds
  end

  test "start_new_browser_session executes a getNewBrowserSession command with the browser string an url" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, "", ""])
    client.start_new_browser_session
	end

  test "start_new_browser_session submit the javascript extension when previously defined" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url
    client.javascript_extension = :the_javascript_extension
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, ""])
    client.start_new_browser_session
  end

  test "start_new_browser_session submit an option when provided" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url
    client.javascript_extension = :the_javascript_extension
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true"])
    client.start_new_browser_session(:captureNetworkTraffic => true)
  end

  test "start_new_browser_session submit multiple options when provided" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url
    client.javascript_extension = :the_javascript_extension
    client.stubs(:remote_control_command)
    client.expects(:string_command).with("getNewBrowserSession", [:the_browser, :the_url, :the_javascript_extension, "captureNetworkTraffic=true;quack=false"])
    client.start_new_browser_session(:captureNetworkTraffic => true, :quack => false)
  end

  test "start_new_browser_session sets the current sessionId with getNewBrowserSession response" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url
    client.stubs(:remote_control_command)
    client.stubs(:string_command).with("getNewBrowserSession", any_parameters).returns("the new session id")
    client.start_new_browser_session
    assert_equal client.session_id, "the new session id"
	end

  test "start_new_browser_session sets remote control timeout to the driver default timeout" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :the_browser, :the_url, 24
    client.stubs(:string_command).with("getNewBrowserSession", any_parameters)
    client.expects(:remote_control_timeout_in_seconds=).with(24)
    client.start_new_browser_session
	end

  test "start_new_browser_session setup auto-higlight of located element when option is set" do
    client = Class.new { include Selenium::Client::Base }.new :highlight_located_element => true
    client.stubs(:remote_control_command)
    client.expects(:highlight_located_element=).with(true)
    client.start_new_browser_session
  end

  test "start_new_browser_session do not setup auto-higlight of located element when option is not set" do
    client = Class.new { include Selenium::Client::Base }.new :highlight_located_element => false
    client.stubs(:remote_control_command)
    client.expects(:highlight_located_element=).never
    client.start_new_browser_session
  end
	
  test "session_started? returns false when no session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :browser, :url
    assert_false client.session_started?
  end

  test "session_started? returns true when session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :browser, :url
    client.stubs(:string_command).returns("A Session Id")
    client.stubs(:remote_control_command)
    client.start_new_browser_session    
    assert_true client.session_started?
  end

  test "session_started? returns false when session has been stopped" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, :browser, :url
    client.stubs(:string_command).returns("A Session Id")
    client.stubs(:remote_control_command)
    client.start_new_browser_session    
    client.stop
    assert_false client.session_started?
  end

  test "chrome_backend? returns true when the browser string is *firefox" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*firefox", :url
    assert_true client.chrome_backend?
  end
  
  test "chrome_backend? returns true when the browser string is *iexplore" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*iexplore", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *safari" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*safari", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *opera" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*opera", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *chrome" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*chrome", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefox2" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*firefox2", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefox3" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*firefox3", :url
    assert_true client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *firefoxproxy" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*firefoxproxy", :url
    assert_false client.chrome_backend?
  end

  test "chrome_backend? returns true when the browser string is *pifirefox" do
    client = Class.new { include Selenium::Client::Base }.new :host, 24, "*pifirefox", :url
    assert_false client.chrome_backend?
  end

  test "Hash initializer sets highlight_located_element_by_default" do
    client_class = Class.new { include Selenium::Client::Base }
    client = client_class.new :highlight_located_element => true
    assert_true client.highlight_located_element_by_default
  end

  test "basic initializer sets highlight_located_element_by_default to false by default" do
    client = Class.new { include Selenium::Client::Base }.new
    assert_false client.highlight_located_element_by_default
  end

  test "Hash initializer sets highlight_located_element_by_default to false by default" do
    client = Class.new { include Selenium::Client::Base }.new :host => :a_host
    assert_false client.highlight_located_element_by_default
  end
    
end
