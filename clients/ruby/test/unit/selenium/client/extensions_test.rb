require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "wait_for_text waits for the innerHTML content of an element when a locator is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(regexp_matches(/findElement\('a_locator'\)/), anything)
    client.wait_for_text "some text", "a_locator"
  end

  test "wait_for_text waits for the page content when no locator is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(regexp_matches(/find\('some text'\)/), anything)
    client.wait_for_text "some text"
  end

  test "wait_for_text uses default timeout when none is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(anything, nil)
    client.wait_for_text "some text"
  end

  test "wait_for_text uses explicit timeout when provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(anything, :explicit_timeout)
    client.wait_for_text "some text", nil, :explicit_timeout
  end

  test "wait_for_no_text waits for the innerHTML content of an element when a locator is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(regexp_matches(/findElement\('a_locator'\)/), anything)
    client.wait_for_no_text "some text", "a_locator"
  end

  test "wait_for_no_text waits for the page content when no locator is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(regexp_matches(/find\('some text'\)/), anything)
    client.wait_for_no_text "some text"
  end

  test "wait_for_no_text uses default timeout when none is provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(anything, nil)
    client.wait_for_no_text "some text"
  end

  test "wait_for_no_text uses explicit timeout when provided" do
    client = Class.new { include Selenium::Client::Extensions }.new
    client.expects(:wait_for_condition).with(anything, :explicit_timeout)
    client.wait_for_no_text "some text", nil, :explicit_timeout
  end
  
end