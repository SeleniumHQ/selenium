require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "remote_control_command return the content of the HTTP response when the command succeeds" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.stubs(:http_request_for).with(:a_verb, :some_args).returns(:the_request)
    client.expects(:http_post).with(:the_request).returns(["OK", "OK,the response"])
    assert_equal "the response", client.remote_control_command(:a_verb, :some_args)
  end

  test "remote_control_command raises a SeleniumCommandError when the command fails" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.stubs(:http_request_for).with(:a_verb, :some_args).returns(:the_request)
    client.expects(:http_post).with(:the_request).returns(["ER", "ERROR,the error message"])
    assert_raises(SeleniumCommandError) { client.remote_control_command(:a_verb, :some_args) }
  end

  test "the args are optional for remote_control_command" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.expects(:http_request_for).with(:a_verb, []).returns(:the_request)
    client.stubs(:http_post).with(:the_request).returns(["OK", "OK,the response"])
    client.remote_control_command(:a_verb)
  end

  test "string_commandreturns the selenese command response" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:remote_control_command).with(:a_verb, :some_args).returns("A String")
    assert_equal "A String", client.string_command(:a_verb, :some_args)
  end

  test "args are optionals for string_command(when there are none)" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:remote_control_command).with(:a_verb, [])
    client.string_command:a_verb
  end

  test "get_string_parses the command response as a CSV row" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:remote_control_command).with(:a_verb, :some_args).returns("One,Two,Three")
    assert_equal ["One", "Two", "Three"], client.string_array_command(:a_verb, :some_args)
  end

  test "get_string_parses the command response preserve spaces" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:remote_control_command).with(:a_verb, :some_args).returns(" One , Two & Three ")
    assert_equal [" One ", " Two & Three "], client.string_array_command(:a_verb, :some_args)
  end

  test "get_string_parses ignore commas escaped with a backspace" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:remote_control_command).with(:a_verb, :some_args).returns("One,Two\\,Three")
    assert_equal ["One", "Two,Three"], client.string_array_command(:a_verb, :some_args)
  end
    
  test "parse_boolean_value returns true when string is true" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal true, client.send(:parse_boolean_value, "true")
  end

  test "parse_boolean_value returns false when string is false" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal false, client.send(:parse_boolean_value, "false")
  end

  test "parse_boolean_value raises when string is neither true nor false" do
    client = Class.new { include Selenium::Client::Protocol }.new
    begin
      client.send(:parse_boolean_value, "unexpected")
      flunk "did not raise as expected"
    rescue Selenium::ProtocolError => e
      assert_equal "Invalid Selenese boolean value that is neither 'true' nor 'false': got 'unexpected'", e.message
    end
  end

  test "boolean_command returns true when string_commandreturns 'true'" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stubs(:string_command).with(:a_verb, :some_args).returns("true")
    assert_equal true, client.boolean_command(:a_verb, :some_args)
  end

  test "args are optionals for boolean_command (when there are none)" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.expects(:string_command).with(:a_verb, []).returns("true")
    client.boolean_command(:a_verb)
  end

  test "boolean_command returns false when string_commandreturns 'false'" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stubs(:string_command).with(:a_verb, :some_args).returns("false")
    assert_equal false, client.boolean_command(:a_verb, :some_args)
  end

  test "boolean_array_command returns an array of evaluated boolean values" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stubs(:string_array_command).with(:a_verb, :some_args).returns(
        ["true", "false", "true", "true", "false"])
    		assert_equal [true, false, true, true, false], client.boolean_array_command(:a_verb, :some_args)
  end
  
  test "http_request_for a verb is cmd=verb" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal "cmd=aCommand", client.send(:http_request_for, "aCommand", [])
  end

  test "http_request_for escape the command" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal "cmd=a+Command+%26+More", client.send(:http_request_for, "a Command & More", [])
  end

  test "http_request_for adds a session_id parameter when client has a current session id" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stubs(:session_id).returns(24)
    assert_equal "cmd=aCommand&sessionId=24", client.send(:http_request_for, "aCommand", [])
  end
  
  test "http_request_for set args as parameters whose key is their index" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal "cmd=aCommand&1=24&2=foo&3=true", client.send(:http_request_for, "aCommand", [24, "foo", true])
  end

  test "http_request_for escapes arg values" do
    client = Class.new { include Selenium::Client::Protocol }.new
    assert_equal "cmd=aCommand&1=This+%26+That", client.send(:http_request_for, "aCommand", [ "This & That" ])
  end
  
end
