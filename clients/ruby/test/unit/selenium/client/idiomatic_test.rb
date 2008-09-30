require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do
  
  test "text_content is an alias for get_text" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getText", [:the_locator,]).returns(:the_text)
    assert_equal :the_text, client.text_content(:the_locator)
  end

  test "title returns the result of the getTitle command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getTitle").returns(:the_title)
    assert_equal :the_title, client.title
  end

  test "location returns the result of the getLocation command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getLocation").returns(:the_location)
    assert_equal :the_location, client.location
  end
  
  test "wait_for_page_to_load wait for a page to load, converting seconds timeout to milliseconds" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("waitForPageToLoad", [2000,])
    client.wait_for_page 2
  end

  test "wait_for_page_to_load wait for a page to load use default timeout when none is specified" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("waitForPageToLoad", [7000,])
    client.stubs(:default_timeout_in_seconds).returns(7)
    client.wait_for_page
  end

  test "wait_for_condition wait for a page to load use default timeout when none is specified" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("waitForCondition", ["some javascript", 7000,])
    client.stubs(:default_timeout_in_seconds).returns(7)
    client.wait_for_condition "some javascript"
  end

  test "wait_for_condition wait for a page to load use explicit timeout when specified, converting it to milliseconds" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("waitForCondition", ["some javascript", 24000,])
    client.stubs(:default_timeout_in_seconds).returns(7)
    client.wait_for_condition "some javascript", 24
  end
  
  test "body_text returns the result of the getBodyText command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getBodyText").returns(:the_text)
    assert_equal :the_text, client.body_text
  end

  test "click just clicks on an element when no options are given" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("click", [:the_locator,])
    client.click :the_locator
  end

  test "click calls wait_for with options provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("click", [:the_locator,])
    client.expects(:wait_for).with(:wait_for => :page)
    client.click :the_locator, :wait_for => :page
  end

  test "wait does nothing when no options are given" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).never
    client.wait_for({})
  end

  test "wait_for waits for page with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_page).with(:the_timeout)
    client.wait_for :wait_for => :page, :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for ajax to complete when ajax option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_ajax).with(nil)
    client.wait_for :wait_for => :ajax
  end

  test "wait_for waits for ajax with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_ajax).with(:the_timeout)
    client.wait_for :wait_for => :ajax, :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for element to be present when element option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_element).with(:the_new_element_id, nil)
    client.wait_for :wait_for => :element, :element => :the_new_element_id
  end

  test "wait_for waits for element with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_element).with(:the_new_element_id, :the_timeout)
    client.wait_for :wait_for => :element, :element => :the_new_element_id,
                    :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for no element to be present when no_element option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_no_element).with(:the_new_element_id, nil)
    client.wait_for :wait_for => :no_element, :element => :the_new_element_id
  end

  test "wait_for waits for no element with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_no_element).with(:the_new_element_id, :the_timeout)
    client.wait_for :wait_for => :no_element, :element => :the_new_element_id,
                    :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for text to be present when text option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_text).with("some text", nil)
    client.wait_for :wait_for => :text, :text => "some text"
  end

  test "wait_for waits for text with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_text).with("some text", :the_timeout)
    client.wait_for :wait_for => :text, :text => "some text",
                    :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for text to NOT be present when no_text option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_no_text).with("some text", nil)
    client.wait_for :wait_for => :no_text, :text => "some text"
  end

  test "wait_for waits for no text with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_no_text).with("some text", :the_timeout)
    client.wait_for :wait_for => :no_text, :text => "some text",
                    :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for effects to complete when effects option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_effects).with(nil)
    client.wait_for :wait_for => :effects
  end

  test "wait_for waits for effects with explicit timeout when one is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_effects).with(:the_timeout)
    client.wait_for :wait_for => :effects, :timeout_in_seconds => :the_timeout
  end

  test "wait_for waits for some javascript to be true when condition option is provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:wait_for_condition).with("some javascript", nil)
    client.wait_for :wait_for => :condition, :javascript => "some javascript"
  end

  test "value returns the result of the getValue command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getValue", [:the_locator,]).returns(:the_value)
    assert_equal :the_value, client.value(:the_locator)
  end

  test "field returns the result of the getValue command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getValue", [:the_locator,]).returns(:the_value)
    assert_equal :the_value, client.field(:the_locator)
  end

  test "checked? returns the result of the isChecked command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isChecked", [:the_locator,]).returns(:the_value)
    assert_equal :the_value, client.checked?(:the_locator)
  end

  test "text? returns the result of the isTextPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isTextPresent", [:the_pattern,]).returns(:the_result)
    assert_equal :the_result, client.text?(:the_pattern)
  end

  test "element? returns the result of the isElementPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isElementPresent", [:the_locator,]).returns(:the_result)
    assert_equal :the_result, client.element?(:the_locator)
  end

  test "alert? returns the result of the isAlertPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isAlertPresent").returns(:the_result)
    assert_equal :the_result, client.alert?
  end

  test "alert returns the result of the getAlert command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getAlert").returns(:the_result)
    assert_equal :the_result, client.alert
  end

  test "confirmation? returns the result of the isConfirmationPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isConfirmationPresent").returns(:the_result)
    assert_equal :the_result, client.confirmation?
  end

  test "confirmation returns the result of the getConfirmation command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getConfirmation").returns(:the_result)
    assert_equal :the_result, client.confirmation
  end

  test "prompt? returns the result of the isPromptPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isPromptPresent").returns(:the_result)
    assert_equal :the_result, client.prompt?
  end

  test "prompt returns the result of the getPrompt command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getPrompt").returns(:the_result)
    assert_equal :the_result, client.prompt
  end

  test "prompt returns the result of the getEval command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getEval", [:the_script,]).returns(:the_result)    
    assert_equal :the_result, client.js_eval(:the_script)
  end
  
  test "table_cell_text returns the result of the getTable command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getTable", [:the_cell_address,]).returns(:the_value)
    assert_equal :the_value, client.table_cell_text(:the_cell_address)
  end

end