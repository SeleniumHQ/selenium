require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "session_started? returns false when no session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    assert_false client.session_started?
  end

  test "session_started? returns true when session has been started" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    client.stubs(:get_string).returns("A Session Id")
    client.start    
    assert_true client.session_started?
  end

  test "session_started? returns false when session has been stopped" do
    client = Class.new { include Selenium::Client::Base }.new :host, :port, :browser, :url
    client.stubs(:get_string).returns("A Session Id")
    client.stubs(:do_command)
    client.start    
    client.stop
    assert_false client.session_started?
  end
  
end
