require File.expand_path("../spec_helper", __FILE__)

describe "SearchContext" do
  class TestSearchContext
    attr_reader :bridge, :ref

    include Selenium::WebDriver::SearchContext

    def initialize(bridge)
      @bridge = bridge
    end
  end

  let(:element)        { mock(:Element)}
  let(:bridge)         { mock(:Bridge).as_null_object   }
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
