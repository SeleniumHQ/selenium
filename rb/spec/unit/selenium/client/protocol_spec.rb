# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

require_relative 'spec_helper'

describe Selenium::Client::Protocol do
  class ProtocolClient
    include Selenium::Client::Protocol
  end

  let(:client) { ProtocolClient.new }

  describe "#remote_control_command" do
    it "returns the content of the HTTP response when the command succeeds" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      allow(client).to receive(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
      expect(client).to receive(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
      expect(client.remote_control_command(:a_verb, :some_args)).to eq("the response")
    end

    it "raises a SeleniumCommandError when the command fails" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      allow(client).to receive(:http_request_for).with(:a_verb, :some_args).and_return(:the_request)
      expect(client).to receive(:http_post).with(:the_request).and_return(["ER", "ERROR,the error message"])
      expect { client.remote_control_command(:a_verb, :some_args) }.to raise_error(Selenium::Client::CommandError)
    end

    it "succeeds when given zero args" do
      client.instance_variable_set :@default_timeout_in_seconds, 1
      expect(client).to receive(:http_request_for).with(:a_verb, []).and_return(:the_request)
      allow(client).to receive(:http_post).with(:the_request).and_return(["OK", "OK,the response"])
      client.remote_control_command(:a_verb)
    end
  end

  describe "#string_command" do
    it "returns the selenese command response" do
      expect(client).to receive(:remote_control_command).with(:a_verb, :some_args).and_return("A String")
      expect(client.string_command(:a_verb, :some_args)).to eq("A String")
    end

    it "succeeds when given zero args" do
      expect(client).to receive(:remote_control_command).with(:a_verb, [])
      client.string_command :a_verb
    end
  end

  describe "#get_string" do # private?
    it "parses the command response as a CSV row" do
      expect(client).to receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two,Three")
      expect(client.string_array_command(:a_verb, :some_args)).to eq(["One", "Two", "Three"])
    end

    it "preserves spaces" do
      expect(client).to receive(:remote_control_command).with(:a_verb, :some_args).and_return(" One , Two & Three ")
      expect(client.string_array_command(:a_verb, :some_args)).to eq([" One ", " Two & Three "])
    end

    it "ignores commas escaped with a backspace" do
      expect(client).to receive(:remote_control_command).with(:a_verb, :some_args).and_return("One,Two\\,Three")
      expect(client.string_array_command(:a_verb, :some_args)).to eq(["One", "Two,Three"])
    end
  end

  describe "parse_boolean_value" do
    it "returns true when string is true" do
      expect(client.send(:parse_boolean_value, "true")).to eq(true)
    end

    it "returns false when string is false" do
      expect(client.send(:parse_boolean_value, "false")).to eq(false)
    end

    it "parse_boolean_value raise a ProtocolError when string is neither true nor false" do
      expect {
        client.send(:parse_boolean_value, "unexpected")
      }.to raise_error(Selenium::Client::ProtocolError, "Invalid Selenese boolean value that is neither 'true' nor 'false': got 'unexpected'")
    end
  end

  describe "#boolean_command or #boolean_array_command" do
    it "returns true when string_command returns 'true'" do
      allow(client).to receive(:string_command).with(:a_verb, :some_args).and_return("true")
      expect(client.boolean_command(:a_verb, :some_args)).to eq(true)
    end

    it "succeeds when given zero args" do
      expect(client).to receive(:string_command).with(:a_verb, []).and_return("true")
      client.boolean_command(:a_verb)
    end

    it "returns false when string_command returns 'false'" do
      allow(client).to receive(:string_command).with(:a_verb, :some_args).and_return("false")
      expect(client.boolean_command(:a_verb, :some_args)).to eq(false)
    end

    it "returns an array of evaluated boolean values" do
      allow(client).to receive(:string_array_command).with(:a_verb, :some_args).
                                          and_return(["true", "false", "true", "true", "false"])

      expect(client.boolean_array_command(:a_verb, :some_args)).to eq([true, false, true, true, false])
    end
  end

  describe "#http_request_for" do
    it "returns cmd=verb for a verb" do
      expect(client.send(:http_request_for, "aCommand", [])).to eq("cmd=aCommand")
    end

    it "escapes the command" do
      expect(client.send(:http_request_for, "a Command & More", [])).to eq("cmd=a+Command+%26+More")
    end

    it "adds a session_id parameter when client has a current session id" do
      allow(client).to receive(:session_id).and_return(24)
      expect(client.send(:http_request_for, "aCommand", [])).to eq("cmd=aCommand&sessionId=24")
    end

    it "sets args as parameters whose key is their index" do
      expect(client.send(:http_request_for, "aCommand", [24, "foo", true])).to eq("cmd=aCommand&1=24&2=foo&3=true")
    end

    it "escapes arg values" do
      expect(client.send(:http_request_for, "aCommand", [ "This & That" ])).to eq("cmd=aCommand&1=This+%26+That")
    end
  end
end
