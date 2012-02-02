require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Protocol do
  class ProtocolClient
    include Selenium::Client::Protocol
  end

  let(:client) { ProtocolClient.new }

  describe "#remote_control_command" do
    it "returns the content of the HTTP response when the command succeeds" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      client.stub!(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
      client.should_receive(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
      client.remote_control_command(:a_verb, :some_args).should == "the response"
    end

    it "raises a SeleniumCommandError when the command fails" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      client.stub!(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
      client.should_receive(:http_post).with(:the_request).and_return(["ER", "ERROR,the error message"])
      lambda { client.remote_control_command(:a_verb, :some_args) }.should raise_error(Selenium::Client::CommandError)
    end

    it "succeeds when given zero args" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      client.should_receive(:http_request_for).with(:a_verb, []).and_return(:the_request)
      client.stub!(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
      client.remote_control_command(:a_verb)
    end
  end

  describe "#string_command" do
    it "returns the selenese command response" do
      client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("A String")
      client.string_command(:a_verb, :some_args).should == "A String"
    end

    it "succeeds when given zero args" do
      client.should_receive(:remote_control_command).with(:a_verb, [])
      client.string_command:a_verb
    end
  end

  describe "#get_string" do # private?
    it "parses the command response as a CSV row" do
      client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two,Three")
      client.string_array_command(:a_verb, :some_args).should == ["One", "Two", "Three"]
    end

    it "preserves spaces" do
      client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return(" One , Two & Three ")
      client.string_array_command(:a_verb, :some_args).should == [" One ", " Two & Three "]
    end

    it "ignores commas escaped with a backspace" do
      client.should_receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two\\,Three")
      client.string_array_command(:a_verb, :some_args).should == ["One", "Two,Three"]
    end
  end

  describe "parse_boolean_value" do
    it "returns true when string is true" do
      client.send(:parse_boolean_value, "true").should == true
    end

    it "returns false when string is false" do
      client.send(:parse_boolean_value, "false").should == false
    end

    it "parse_boolean_value raise a ProtocolError when string is neither true nor false" do
      lambda {
        client.send(:parse_boolean_value, "unexpected")
      }.should raise_error(Selenium::Client::ProtocolError, "Invalid Selenese boolean value that is neither 'true' nor 'false': got 'unexpected'")
    end
  end

  describe "#boolean_command or #boolean_array_command" do
    it "returns true when string_command returns 'true'" do
      client.stub!(:string_command).with(:a_verb, :some_args).and_return("true")
      client.boolean_command(:a_verb, :some_args).should == true
    end

    it "succeeds when given zero args" do
      client.should_receive(:string_command).with(:a_verb, []).and_return("true")
      client.boolean_command(:a_verb)
    end

    it "returns false when string_command returns 'false'" do
      client.stub!(:string_command).with(:a_verb, :some_args).and_return("false")
      client.boolean_command(:a_verb, :some_args).should == false
    end

    it "returns an array of evaluated boolean values" do
      client.stub!(:string_array_command).with(:a_verb, :some_args).
                                          and_return(["true", "false", "true", "true", "false"])

      client.boolean_array_command(:a_verb, :some_args).should == [true, false, true, true, false]
    end
  end

  describe "#http_request_for" do
    it "returns cmd=verb for a verb" do
      client.send(:http_request_for, "aCommand", []).should == "cmd=aCommand"
    end

    it "escapes the command" do
      client.send(:http_request_for, "a Command & More", []).should == "cmd=a+Command+%26+More"
    end

    it "adds a session_id parameter when client has a current session id" do
      client.stub!(:session_id).and_return(24)
      client.send(:http_request_for, "aCommand", []).should == "cmd=aCommand&sessionId=24"
    end

    it "sets args as parameters whose key is their index" do
      client.send(:http_request_for, "aCommand", [24, "foo", true]).should == "cmd=aCommand&1=24&2=foo&3=true"
    end

    it "escapes arg values" do
      client.send(:http_request_for, "aCommand", [ "This & That" ]).should == "cmd=aCommand&1=This+%26+That"
    end
  end
end
