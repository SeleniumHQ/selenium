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

describe Selenium::Client::JavascriptExpressionBuilder do
  def builder(*args)
    @builder ||= Selenium::Client::JavascriptExpressionBuilder.new(*args)
  end

  it "can append arbitrary text to builder" do
    builder.append("hello").append(" world")
    expect(builder.script).to eq("hello world")
  end

  it "returns the correct #no_pending_ajax_requests script for Prototype" do
    builder = builder(:prototype)
    expect(builder.no_pending_ajax_requests.script).to eq("selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0;")
  end

  it "returns the correct #no_pending_ajax_requests script for jQuery" do
    builder = builder(:jquery)
    expect(builder.no_pending_ajax_requests.script).to eq("selenium.browserbot.getCurrentWindow().jQuery.active == 0;")
  end

  it "returns the correct #no_pending_effects for Prototype" do
    builder = builder(:prototype)
    expect(builder.no_pending_effects.script).to eq("selenium.browserbot.getCurrentWindow().Effect.Queue.size() == 0;")
  end

  describe "#quote_escaped" do
    it "returns a locator as is when it has no single quotes" do
      expect(builder.quote_escaped("the_locator")).to eq("the_locator")
    end

    it "escapes single quotes" do
      expect(builder.quote_escaped("//div[@id='demo-effect-appear']")).to eq("//div[@id=\\'demo-effect-appear\\']")
    end

    it "escapes backslashes" do
      expect(builder.quote_escaped("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/")).to eq("webratlink=evalregex:/Pastry Lovers \\\\(Organizer\\\\)/")
    end
  end

  describe "#text_match" do
    it "matches on entire string when pattern is a string" do
      expect(builder.text_match("some text")).to eq("element.innerHTML == 'some text'")
    end

    it "performs a regexp match when pattern is a regexp" do
      expect(builder.text_match(/some text/)).to eq("null != element.innerHTML.match(/some text/)")
    end

    it "escapes rexpexp when pattern is a regexp" do
      expect(builder.text_match(/some.*text/)).to eq("null != element.innerHTML.match(/some.*text/)")
    end
  end

  describe "#find_element" do
    it "adds a script to find an element" do
      expect(builder.find_element('a_locator').script).to match(/element\s+=\s+selenium.browserbot.findElement\('a_locator'\);/m)
    end

    it "should handle embedded evalregex locators" do
      expect(builder.find_element("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").script).to match(/element\s+=\s+selenium.browserbot.findElement\('webratlink=evalregex:\/Pastry Lovers \\\\\(Organizer\\\\\)\/'\);/m)
    end
  end

  describe "#javascript_framework_for" do
    it "returns JavascriptFrameworks::Prototype when argument is :prototype" do
      expect(builder.javascript_framework_for(:prototype)).to eq(Selenium::Client::JavascriptFrameworks::Prototype)
    end

    it "returns JavascriptFrameworks::JQuery when argument is :jquery" do
      expect(builder.javascript_framework_for(:jquery)).to eq(Selenium::Client::JavascriptFrameworks::JQuery)
    end

    it "raises a Runtime for unsupported frameworks" do
      expect { builder.javascript_framework_for(:unsupported_framework) }.to raise_error(RuntimeError)
    end
  end
end
