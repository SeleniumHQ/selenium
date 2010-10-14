require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do

  test "can append arbitrary text to builder" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    builder.append("hello").append(" world")
    assert_equal "hello world", builder.script
  end

   test "no_pending_ajax_requests for Prototype" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:prototype)
     assert_equal "selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0;", 
                  builder.no_pending_ajax_requests.script
   end

   test "no_pending_ajax_requests for jQuery" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:jquery)
     assert_equal "selenium.browserbot.getCurrentWindow().jQuery.active == 0;", 
                  builder.no_pending_ajax_requests.script
   end

   test "no_pending_effects for prototype" do
     builder = Selenium::Client::JavascriptExpressionBuilder.new(:prototype)
     assert_equal "selenium.browserbot.getCurrentWindow().Effect.Queue.size() == 0;", 
                  builder.no_pending_effects.script
   end

  test "quote_escaped returns a locator has is when its does not include any single quote" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "the_locator", builder.quote_escaped("the_locator")
  end

  test "quote_escaped escape single quotes" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "//div[@id=\\'demo-effect-appear\\']", 
                 builder.quote_escaped("//div[@id='demo-effect-appear']")
  end

  test "quote_escaped escapes backslashes" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "webratlink=evalregex:/Pastry Lovers \\\\(Organizer\\\\)/", 
                 builder.quote_escaped("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/")
  end

  test "text_match matches on entire string when pattern is a string" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "element.innerHTML == 'some text'", 
                 builder.text_match("some text")
  end    

  test "text_match performs a regexp match when pattern is a regexp" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "null != element.innerHTML.match(/some text/)", 
                 builder.text_match(/some text/)
  end

  test "text_match escapes rexpexp when pattern is a regexp" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal "null != element.innerHTML.match(/some.*text/)", 
                 builder.text_match(/some.*text/)
  end    

  test "find_element adds a script to find an element" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_match(/element\s+=\s+selenium.browserbot.findElement\('a_locator'\);/m, 
                 builder.find_element('a_locator').script)
  end

  test "find_element should handle embedded evalregex locators" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_match(/element\s+=\s+selenium.browserbot.findElement\('webratlink=evalregex:\/Pastry Lovers \\\\\(Organizer\\\\\)\/'\);/m, 
                 builder.find_element("webratlink=evalregex:/Pastry Lovers \\(Organizer\\)/").script)
  end

  test "javascript_framework_for :prototype returns JavascriptFrameworks::Prototype" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal Selenium::Client::JavascriptFrameworks::Prototype, 
                 builder.javascript_framework_for(:prototype)
  end

  test "javascript_framework_for :jquery returns JavascriptFrameworks::JQuery" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_equal Selenium::Client::JavascriptFrameworks::JQuery, 
                 builder.javascript_framework_for(:jquery)
  end

  test "javascript_framework_for raises for unsupported framework" do
    builder = Selenium::Client::JavascriptExpressionBuilder.new
    assert_raises(RuntimeError) { builder.javascript_framework_for(:unsupported_framework) }
  end
  
end
