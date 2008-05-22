require File.expand_path(File.dirname(__FILE__) + '/unit_test_helper')

unit_tests do
  
  test "get_string returns the selenese command response" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    client.expects(:do_command).with(:a_verb, :some_args).returns("A String")
    assert_equal "A String", client.get_string(:a_verb, :some_args)
  end
  
  test "parse_boolean_value returns true when string is true" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal true, client.send(:parse_boolean_value, "true")
  end

  test "parse_boolean_value returns false when string is false" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal false, client.send(:parse_boolean_value, "false")
  end

  test "parse_boolean_value raises when string is neither true nor false" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    begin
      client.send(:parse_boolean_value, "unexpected")
      flunk "did not raise as expected"
    rescue Selenium::ProtocolError => e
      assert_equal "Invalid Selenese boolean value that is neither 'true' nor 'false': got 'unexpected'", e.message
    end
  end

  test "get_boolean returns true when get_string returns 'true'" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    client.stubs(:get_string).with(:a_verb, :some_args).returns("true")
    assert_equal true, client.get_boolean(:a_verb, :some_args)
  end

  test "get_boolean returns false when get_string returns 'false'" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    client.stubs(:get_string).with(:a_verb, :some_args).returns("false")
    assert_equal false, client.get_boolean(:a_verb, :some_args)
  end

  test "get_boolean_array returns an array of evaluated boolean values" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    client.stubs(:get_string_array).with(:a_verb, :some_args).returns(
        ["true", "false", "true", "true", "false"])
    assert_equal [true, false, true, true, false], client.get_boolean_array(:a_verb, :some_args)
  end
  
  test "http_request_for a verb is cmd=verb" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal "cmd=aCommand", client.send(:http_request_for, "aCommand", [])
  end

  test "http_request_for escape the command" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal "cmd=a+Command+%26+More", client.send(:http_request_for, "a Command & More", [])
  end

  test "http_request_for adds a session_id parameter when client has a current session id" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    client.stubs(:session_id).returns(24)
    assert_equal "cmd=aCommand&sessionId=24", client.send(:http_request_for, "aCommand", [])
  end
  
  test "http_request_for set args as parameters whose key is their index" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal "cmd=aCommand&1=24&2=foo&3=true", client.send(:http_request_for, "aCommand", [24, "foo", true])
  end

  test "http_request_for escapes arg values" do
    client = Class.new { include Selenium::Client::SeleneseClient }.new
    assert_equal "cmd=aCommand&1=This+%26+That", client.send(:http_request_for, "aCommand", [ "This & That" ])
  end
    
end