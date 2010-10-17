require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::JavascriptExpressionBuilder do
  def builder(*args)
    @builder ||= Selenium::Client::JavascriptExpressionBuilder.new(*args)
  end

  it "can append arbitrary text to builder" do
    builder.append("hello").append(" world")
    builder.script.should == "hello world"
  end

  it "returns the correct #no_pending_ajax_requests script for Prototype" do
    builder = builder(:prototype)
    builder.no_pending_ajax_requests.script.should == "selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0;"
  end

  it "returns the correct #no_pending_ajax_requests script for jQuery" do
    builder = builder(:jquery)
    builder.no_pending_ajax_requests.script.should == "selenium.browserbot.getCurrentWindow().jQuery.active == 0;"
  end

  it "returns the correct #no_pending_effects for Prototype" do
    builder = builder(:prototype)
    builder.no_pending_effects.script.should == "selenium.browserbot.getCurrentWindow().Effect.Queue.size() == 0;"
  end

  describe "#quote_escaped" do
    it "returns a locator as is when it has no single quotes" do
      builder.quote_escaped("the_locator").should == "the_locator"
    end

    it "escapes single quotes" do
      builder.quote_escaped("//div[@id='demo-effect-appear']").should == "//div[@id=\\'demo-effect-appear\\']"
    end

    it "escapes backslashes" do
      builder.quote_escaped("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").should == "webratlink=evalregex:/Pastry Lovers \\\\(Organizer\\\\)/"
    end
  end

  describe "#text_match" do
    it "matches on entire string when pattern is a string" do
      builder.text_match("some text").should == "element.innerHTML == 'some text'"
    end

    it "performs a regexp match when pattern is a regexp" do
      builder.text_match(/some text/).should == "null != element.innerHTML.match(/some text/)"
    end

    it "escapes rexpexp when pattern is a regexp" do
      builder.text_match(/some.*text/).should == "null != element.innerHTML.match(/some.*text/)"
    end
  end

  describe "#find_element" do
    it "adds a script to find an element" do
      builder.find_element('a_locator').script.should =~ /element\s+=\s+selenium.browserbot.findElement\('a_locator'\);/m
    end

    it "should handle embedded evalregex locators" do
      builder.find_element("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").script.should =~ /element\s+=\s+selenium.browserbot.findElement\('webratlink=evalregex:\/Pastry Lovers \\\\\(Organizer\\\\\)\/'\);/m
    end
  end

  describe "#javascript_framework_for" do
    it "returns JavascriptFrameworks::Prototype when argument is :prototype" do
      builder.javascript_framework_for(:prototype).should == Selenium::Client::JavascriptFrameworks::Prototype
    end

    it "returns JavascriptFrameworks::JQuery when argument is :jquery" do
      builder.javascript_framework_for(:jquery).should == Selenium::Client::JavascriptFrameworks::JQuery
    end

    it "raises a Runtime for unsupported frameworks" do
      lambda { builder.javascript_framework_for(:unsupported_framework) }.should raise_error(RuntimeError)
    end
  end
end
