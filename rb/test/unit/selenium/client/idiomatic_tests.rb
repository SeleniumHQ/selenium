require File.expand_path(File.dirname(__FILE__) + '/../../unit_test_helper')

unit_tests do

  test "text is an alias for get_text" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getText", [:the_locator,]).returns(:the_text)
    assert_equal :the_text, client.text(:the_locator)
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
  
  describe "wait_for_page and wait_for_page_to_load" do

    test "wait_for_page wait for a page to load, converting seconds timeout to milliseconds" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page 2
    end

    test "wait_for_page wait for a page to load use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPageToLoad", [7000,])
      client.stubs(:default_timeout_in_seconds).returns(7)
      client.wait_for_page
    end

    test "wait_for_page wait for a page to load, can take a string timeout for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page "2"
    end

    test "wait_for_page_to_load is an alias for wait_for_page providing easy transition to people used to the old API" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPageToLoad", [24000,])
      client.wait_for_page_to_load 24
    end

    test "wait_for_page_to_load wait for a page to load use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPageToLoad", [7000,])
      client.stubs(:default_timeout_in_seconds).returns(7)
      client.wait_for_page
    end

  end

  describe "wait_for_popup" do

    test "wait_for_popup returns the result of the waitForPopUp command" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPopUp", [:the_window_id, 0]).returns(:the_value)
      assert_equal :the_value, client.wait_for_popup(:the_window_id, 0)
    end

    test "wait_for_popup convert the timeout from seconds to milliseconds" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPopUp", [:the_window_id, 3000]).returns(:the_value)
      assert_equal :the_value, client.wait_for_popup(:the_window_id, 3)
    end

    test "wait_for_popup timeout can be specified as a string for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPopUp", [:the_window_id, 5000]).returns(:the_value)
      assert_equal :the_value, client.wait_for_popup(:the_window_id, "5")
    end
  
    test "wait_for_popup use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForPopUp", [:the_window_id, 7000]).returns(:the_value)
      client.stubs(:default_timeout_in_seconds).returns(7)
      client.wait_for_popup :the_window_id
    end

  end

  describe "wait_for_condition" do

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

    test "wait_for_condition timeout can be specified as a string for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("waitForCondition", ["some javascript", 64000,])
      client.stubs(:default_timeout_in_seconds).returns(7)
      client.wait_for_condition "some javascript", "64"
    end

  end
  
  describe "wait_for" do

    test "wait_for does nothing when no options are given" do
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
      client.expects(:wait_for_ajax)
      client.wait_for :wait_for => :ajax
    end

    test "wait_for waits for ajax to relays javascript framework override" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_ajax).with(has_entry(:javascript_framework => :jquery))
      client.wait_for :wait_for => :ajax, :javascript_framework => :jquery
    end

    test "wait_for waits for ajax with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_ajax).with(has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :ajax, :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for element to be present when element option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_element).with(:the_new_element_id, anything)
      client.wait_for :wait_for => :element, :element => :the_new_element_id
    end

    test "wait_for waits for element with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_element).with(:the_new_element_id, has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :element, :element => :the_new_element_id,
                      :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for no element to be present when no_element option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_element).with(:the_new_element_id, has_entry(:element => :the_new_element_id))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id
    end

    test "wait_for waits for no element with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_element).with(:the_new_element_id, has_entry(:element => :the_new_element_id, :timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id,
                      :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for text to be present when text option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_text).with("some text", has_entry(:element => "a locator", :text => "some text"))
      client.wait_for :wait_for => :text, :element => "a locator", :text => "some text"
    end

    test "wait_for waits for text with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_text).with("some text", has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :text, :text => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for text to NOT be present when no_text option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_text).with("some text", has_entry(:element => 'a_locator'))
      client.wait_for :wait_for => :no_text, :element => 'a_locator', :text => "some text"
    end

    test "wait_for waits for no text with explicit timeout and locator when none are provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_text).with("some text", has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_text, :text => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for effects to complete when effects option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_effects)
      client.wait_for :wait_for => :effects
    end

    test "wait_for waits for effects with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_effects).with(has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :effects, :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for effects to relays javascript framework override" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_effects).with(has_entry(:javascript_framework => :jquery))
      client.wait_for :wait_for => :effects, :javascript_framework => :jquery
    end

    test "wait_for waits for popup to appear when popup option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_popup).with(:the_window_id, nil)
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    test "wait_for for popup uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_popup).with(:the_window_id, :the_timeout)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :timeout_in_seconds => :the_timeout
    end

    test "wait_for for popup also selects the popup when the select option is true" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_popup).with(:the_window_id, nil)
      client.expects(:select_window).with(:the_window_id)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :select => true
    end

    test "wait_for for popup does not select the popup when the select option is false" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_popup).with(:the_window_id, nil)
      client.expects(:select_window).with(:the_window_id).never
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    test "wait_for waits for field value when value option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :value, :element => :the_locator, :value => :expected_value
    end
  
    test "wait_for for field value uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_field_value).with(:the_locator, 
          :expected_value, 
          has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :value, :element => :the_locator, 
                                           :value => :expected_value, 
                                           :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for no field value when value option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :no_value, :element => :the_locator, :value => :expected_value
    end
  
    test "wait_for for no field value uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_no_field_value).with(:the_locator, 
          :expected_value, 
          has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_value, :element => :the_locator, 
                                              :value => :expected_value, 
                                              :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for element to be visible when visible option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :visible, :element => :the_locator, :value => :expected_value
    end

    test "wait_for for visible uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_visible).with(:the_locator, 
          has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :visible, :element => :the_locator, 
                                             :timeout_in_seconds => :the_timeout
    end

    test "wait_for waits for element to not be visible when visible option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_not_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :not_visible, :element => :the_locator, :value => :expected_value
    end

    test "wait_for for not visible uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_not_visible).with(:the_locator, 
          has_entry(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :not_visible, :element => :the_locator, 
                                                 :timeout_in_seconds => :the_timeout
    end
  
    test "wait_for waits for some javascript to be true when condition option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:wait_for_condition).with("some javascript", nil)
      client.wait_for :wait_for => :condition, :javascript => "some javascript"
    end

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

  test "visible? returns the result of the isTextPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isVisible", [:the_locator,]).returns(:the_result)
    assert_equal :the_result, client.visible?(:the_locator)
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

  test "cookies returns the result of the getCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getCookie").returns(:the_value)
    assert_equal :the_value, client.cookies
  end

  test "cookie returns the result of the getCookieByName command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getCookieByName", [:the_name,]).returns(:the_value)
    assert_equal :the_value, client.cookie(:the_name)
  end

  test "cookie? returns the result of the isCookiePresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:boolean_command).with("isCookiePresent", [:the_name,]).returns(:the_value)
    assert_equal :the_value, client.cookie?(:the_name)
  end

  test "create_cookie returns the result of the createCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("createCookie", [:the_name_value_pair, "options"]).returns(:the_value)
    assert_equal :the_value, client.create_cookie(:the_name_value_pair, "options")
  end

  test "options are optional for create_cookie" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("createCookie", [:the_name_value_pair, ""]).returns(:the_value)
    assert_equal :the_value, client.create_cookie(:the_name_value_pair)
  end

  test "create_cookie take options has a hash" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("createCookie", 
        any_of([:the_name_value_pair, "max_age=60, domain=.foo.com"],
               [:the_name_value_pair, "domain=.foo.com, max_age=60"]
    )).returns(:the_value)
    assert_equal :the_value, client.create_cookie(:the_name_value_pair, {:max_age => 60, :domain => ".foo.com"})
  end

  test "delete_cookie returns the result of the createCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("deleteCookie", [:the_name, "options"]).returns(:the_value)
    assert_equal :the_value, client.delete_cookie(:the_name, "options")
  end

  test "options are optional for delete_cookie" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("deleteCookie", [:the_name, ""]).returns(:the_value)
    assert_equal :the_value, client.delete_cookie(:the_name)
  end

  test "delete_cookie take options has a hash" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("deleteCookie", [:the_name, "domain=.foo.com, max_age=60"]).returns(:the_value)
    assert_equal :the_value, client.delete_cookie(:the_name, {:max_age => 60, :domain => ".foo.com"})
  end
  
  test "all_window_ids returns the result of the getAllWindowIds command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_array_command).with("getAllWindowIds").returns(:the_value)
    assert_equal :the_value, client.all_window_ids
  end

  test "all_window_names returns the result of the getAllWindowNames command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_array_command).with("getAllWindowNames").returns(:the_value)
    assert_equal :the_value, client.all_window_names
  end

  test "all_window_titles returns the result of the getAllWindowTitles command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_array_command).with("getAllWindowTitles").returns(:the_value)
    assert_equal :the_value, client.all_window_titles
  end

  describe "browser_network_traffic" do

    test "browser_network_traffic returns the result of the captureNetworkTraffic command" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("captureNetworkTraffic", ["json"]).returns(:the_value)
      assert_equal :the_value, client.browser_network_traffic(:json)
    end

    test "browser_network_traffic format default to plain" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.expects(:remote_control_command).with("captureNetworkTraffic", ["plain"]).returns(:the_value)
      assert_equal :the_value, client.browser_network_traffic
    end

    test "browser_network_traffic raises when format is nil" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      assert_raise(RuntimeError) { client.browser_network_traffic(nil) }
    end

    test "browser_network_traffic raises when format is not :plain, :json or :xml" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      assert_raise(RuntimeError) { client.browser_network_traffic(:random_format) }
    end

  end

  test "browser_xpath_library= invokes the useXpathLibrary command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("useXpathLibrary", ["ajaxslt"]).returns(:the_value)
    client.browser_xpath_library = :ajaxslt
  end

  test "browser_xpath_library= raises whe library name is not :ajaxslt, :javascript-xpath, or :default" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    assert_raises(RuntimeError) { client.browser_xpath_library = :random_library }
  end

  test "setting highlight_located_element to true enables auto-hilighting in selenium core" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = true")
    client.highlight_located_element = true
  end

  test "setting highlight_located_element to false disables auto-hilighting in selenium core" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = false")
    client.highlight_located_element = false
  end

  test "execution_delay returns the result of the getSpeed command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:string_command).with("getSpeed").returns(:the_speed)
    assert_equal :the_speed, client.execution_delay
  end

  test "execution_delay= executes the setSpeed command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.expects(:remote_control_command).with("setSpeed", [24])
    client.execution_delay= 24
  end

end