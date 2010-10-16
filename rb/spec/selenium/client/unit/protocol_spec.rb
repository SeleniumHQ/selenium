require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Protocol do
  
  it "remote_control_command return the content of the HTTP response when the command succeeds" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.stub!(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
    client.should_receive(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
    client.remote_control_command(:a_verb, :some_args).should == "the response"
  end

  it "remote_control_command raises a SeleniumCommandError when the command fails" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.stub!(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
    client.should_receive(:http_post).with(:the_request).and_return(["ER", "ERROR,the error message"])
    lambda { client.remote_control_command(:a_verb, :some_args) }.should raise_error(SeleniumCommandError)
  end

  it "the args are optional for remote_control_command" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.instance_variable_set :@default_timeout_in_seconds, 1
    client.should_receive(:http_request_for).with(:a_verb, []).and_return(:the_request)
    client.stub!(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
    client.remote_control_command(:a_verb)
  end

  it "string_commandreturns the selenese command response" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("A String")
    client.string_command(:a_verb, :some_args).should == "A String"
  end

  it "args are optionals for string_command(when there are none)" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:remote_control_command).with(:a_verb, [])
    client.string_command:a_verb
  end

  it "get_string_parses the command response as a CSV row" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two,Three")
    client.string_array_command(:a_verb, :some_args).should == ["One", "Two", "Three"]
  end

  it "get_string_parses the command response preserve spaces" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return(" One , Two & Three ")
    client.string_array_command(:a_verb, :some_args).should == [" One ", " Two & Three "]
  end

  it "get_string_parses ignore commas escaped with a backspace" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two\\,Three")
    client.string_array_command(:a_verb, :some_args).should == ["One", "Two,Three"]
  end
    
  it "parse_boolean_value returns true when string is true" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:parse_boolean_value, "true").should == true
  end

  it "parse_boolean_value returns false when string is false" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:parse_boolean_value, "false").should == false
  end

  it "parse_boolean_value raises when string is neither true nor false" do
    client = Class.new { include Selenium::Client::Protocol }.new
    begin
      client.send(:parse_boolean_value, "unexpected")
      fail "did not raise as expected"
    rescue Selenium::Client::ProtocolError => e
      e.message.should == "Invalid Selenese boolean value that is neither 'true' nor 'false': got 'unexpected'"
    end
  end

  it "boolean_command returns true when string_commandreturns 'true'" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stub!(:string_command).with(:a_verb, :some_args).and_return("true")
    client.boolean_command(:a_verb, :some_args).should == true
  end

  it "args are optionals for boolean_command (when there are none)" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.should_receive(:string_command).with(:a_verb, []).and_return("true")
    client.boolean_command(:a_verb)
  end

  it "boolean_command returns false when string_commandreturns 'false'" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stub!(:string_command).with(:a_verb, :some_args).and_return("false")
    client.boolean_command(:a_verb, :some_args).should == false
  end

  it "boolean_array_command returns an array of evaluated boolean values" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stub!(:string_array_command).with(:a_verb, :some_args).and_return(
        ["true", "false", "true", "true", "false"])
    client.boolean_array_command(:a_verb, :some_args).should == [true, false, true, true, false]
  end
  
  it "http_request_for a verb is cmd=verb" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:http_request_for, "aCommand", []).should == "cmd=aCommand"
  end

  it "http_request_for escape the command" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:http_request_for, "a Command & More", []).should == "cmd=a+Command+%26+More"
  end

  it "http_request_for adds a session_id parameter when client has a current session id" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.stub!(:session_id).and_return(24)
    client.send(:http_request_for, "aCommand", []).should == "cmd=aCommand&sessionId=24"
  end
  
  it "http_request_for set args as parameters whose key is their index" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:http_request_for, "aCommand", [24, "foo", true]).should == "cmd=aCommand&1=24&2=foo&3=true"
  end

  it "http_request_for escapes arg values" do
    client = Class.new { include Selenium::Client::Protocol }.new
    client.send(:http_request_for, "aCommand", [ "This & That" ]).should == "cmd=aCommand&1=This+%26+That"
  end
  
end
