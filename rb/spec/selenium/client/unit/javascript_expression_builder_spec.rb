require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::JavascriptExpressionBuilder do

  it "can append arbitrary text to builder" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.append("hello").append(" world")
    builder.script.should == "hello world"
  end

   it "no_pending_ajax_requests for Prototype" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:prototype)
     builder.no_pending_ajax_requests.script.should == "selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0;"
   end

   it "no_pending_ajax_requests for jQuery" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:jquery)
     builder.no_pending_ajax_requests.script.should == "selenium.browserbot.getCurrentWindow().jQuery.active == 0;"
   end

   it "no_pending_effects for prototype" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:prototype)
     builder.no_pending_effects.script.should == "selenium.browserbot.getCurrentWindow().Effect.Queue.size() == 0;"
   end

  it "quote_escaped returns a locator has is when its does not include any single quote" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.quote_escaped("the_locator").should == "the_locator"
  end

  it "quote_escaped escape single quotes" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.quote_escaped("//div[@id='demo-effect-appear']").should == "//div[@id=\\'demo-effect-appear\\']"
  end

  it "quote_escaped escapes backslashes" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.quote_escaped("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").should == "webratlink=evalregex:/Pastry Lovers \\\\(Organizer\\\\)/"
  end

  it "text_match matches on entire string when pattern is a string" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.text_match("some text").should == "element.innerHTML == 'some text'"
  end    

  it "text_match performs a regexp match when pattern is a regexp" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.text_match(/some text/).should == "null != element.innerHTML.match(/some text/)"
  end

  it "text_match escapes rexpexp when pattern is a regexp" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.text_match(/some.*text/).should == "null != element.innerHTML.match(/some.*text/)"
  end    

  it "find_element adds a script to find an element" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.find_element('a_locator').script.should =~ /element\s+=\s+selenium.browserbot.findElement\('a_locator'\);/m
  end

  it "find_element should handle embedded evalregex locators" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.find_element("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").script.should =~ /element\s+=\s+selenium.browserbot.findElement\('webratlink=evalregex:\/Pastry Lovers \\\\\(Organizer\\\\\)\/'\);/m
  end

  it "javascript_framework_for :prototype returns JavascriptFrameworks::Prototype" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.javascript_framework_for(:prototype).should == Selenium::Client::JavascriptFrameworks::Prototype
  end

  it "javascript_framework_for :jquery returns JavascriptFrameworks::JQuery" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.javascript_framework_for(:jquery).should == Selenium::Client::JavascriptFrameworks::JQuery
  end

  it "javascript_framework_for raises for unsupported framework" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    lambda { builder.javascript_framework_for(:unsupported_framework) }.should raise_error(RuntimeError)
  end
  
end
