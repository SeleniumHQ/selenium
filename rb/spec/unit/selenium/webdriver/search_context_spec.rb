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

require File.expand_path("../spec_helper", __FILE__)

describe "SearchContext" do
  class TestSearchContext
    attr_reader :bridge, :ref

    include Selenium::WebDriver::SearchContext

    def initialize(bridge)
      @bridge = bridge
    end
  end

  let(:element)        { double(:Element)}
  let(:bridge)         { double(:Bridge).as_null_object   }
  let(:search_context) { TestSearchContext.new(bridge)  }

  context "finding a single element" do
    it "accepts a hash" do
      bridge.should_receive(:find_element_by).with('id', "bar", nil).and_return(element)
      search_context.find_element(:id => "bar").should == element
    end

    it "accepts two arguments" do
      bridge.should_receive(:find_element_by).with('id', "bar", nil).and_return(element)
      search_context.find_element(:id, "bar").should == element
    end

    it "raises an error if given an invalid 'by'" do
      lambda {
        search_context.find_element(:foo => "bar")
      }.should raise_error(ArgumentError, 'cannot find element by :foo')
    end

    it "does not modify the hash given" do
      selector = {:id => "foo"}

      search_context.find_element(selector)

      selector.should == {:id => "foo"}
    end
  end

  context "finding multiple elements" do
    it "accepts a hash" do
      bridge.should_receive(:find_elements_by).with('id', "bar", nil).and_return([])
      search_context.find_elements(:id => "bar").should == []
    end

    it "accepts two arguments" do
      bridge.should_receive(:find_elements_by).with('id', "bar", nil).and_return([])
      search_context.find_elements(:id, "bar").should == []
    end

    it "raises an error if given an invalid 'by'" do
      lambda {
        search_context.find_elements(:foo => "bar")
      }.should raise_error(ArgumentError, 'cannot find elements by :foo')
    end
  end
end
