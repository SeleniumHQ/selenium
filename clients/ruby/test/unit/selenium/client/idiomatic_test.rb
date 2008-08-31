require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "text_content is an alias for get_text" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_text).with(:the_locator).returns(:the_text)
    assert_equal :the_text, client.text_content(:the_locator)
  end

  test "title is an alias for get_title" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_string).with("getTitle", []).returns(:the_title)
    assert_equal :the_title, client.title
  end
  
  test "wait_for_page_to_load wait for a page to load, converting seconds timeout to milliseconds" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:do_command).with("waitForPageToLoad", [2000,])
    client.wait_for_page 2
  end

  test "wait_for_page_to_load wait for a page to load use default timeout when none is specified" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:do_command).with("waitForPageToLoad", [7000,])
    client.stubs(:default_timeout_in_seconds).returns(7)
    client.wait_for_page
  end
  
  test "click just clicks on an element when no options are given" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:do_command).with("click", [:the_locator,])
    client.click :the_locator
  end

  test "click waits for page to load when wait_for option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:do_command).with("click", [:the_locator,])
    client.expects(:wait_for_page).with(nil)
    client.click :the_locator, :wait_for => :page
  end

  test "click waits for pagewith explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:do_command).with("click", [:the_locator,])
    client.expects(:wait_for_page).with(:the_timeout)
    client.click :the_locator, :wait_for => :page, :timeout_in_seconds => :the_timeout
  end

  test "value returns the result of the getValue command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_string).with("getValue", [:the_locator,]).returns(:the_value)
    assert_equal :the_value, client.value(:the_locator)
  end

  test "text_present? returns the result of the isTextPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_boolean).with("isTextPresent", [:the_pattern,]).returns(:the_result)
    assert_equal :the_result, client.text_present?(:the_pattern)
  end

  test "element_present? returns the result of the isElementPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_boolean).with("isElementPresent", [:the_locator,]).returns(:the_result)
    assert_equal :the_result, client.element_present?(:the_locator)
  end

  test "alert returns the result of the getAlert command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:get_string).with("getAlert", []).returns(:the_result)
    assert_equal :the_result, client.alert
  end
  
end