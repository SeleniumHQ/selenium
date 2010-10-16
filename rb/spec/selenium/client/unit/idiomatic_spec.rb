require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Idiomatic do

  it "text is an alias for get_text" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getText", [:the_locator,]).and_return(:the_text)
    client.text(:the_locator).should == :the_text
  end

  it "title returns the result of the getTitle command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getTitle").and_return(:the_title)
    client.title.should == :the_title
  end

  it "location returns the result of the getLocation command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getLocation").and_return(:the_location)
    client.location.should == :the_location
  end
  
  describe "wait_for_page and wait_for_page_to_load" do

    it "wait_for_page wait for a page to load, converting seconds timeout to milliseconds" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page 2
    end

    it "wait_for_page wait for a page to load use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPageToLoad", [7000,])
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_page
    end

    it "wait_for_page wait for a page to load, can take a string timeout for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page "2"
    end

    it "wait_for_page_to_load is an alias for wait_for_page providing easy transition to people used to the old API" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPageToLoad", [24000,])
      client.wait_for_page_to_load 24
    end

    it "wait_for_page_to_load wait for a page to load use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPageToLoad", [7000,])
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_page
    end

  end

  describe "wait_for_popup" do

    it "wait_for_popup returns the result of the waitForPopUp command" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 0]).and_return(:the_value)
      client.wait_for_popup(:the_window_id, 0).should == :the_value
    end

    it "wait_for_popup convert the timeout from seconds to milliseconds" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 3000]).and_return(:the_value)
      client.wait_for_popup(:the_window_id, 3).should == :the_value
    end

    it "wait_for_popup timeout can be specified as a string for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 5000]).and_return(:the_value)
      client.wait_for_popup(:the_window_id, "5").should == :the_value
    end
  
    it "wait_for_popup use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 7000]).and_return(:the_value)
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_popup :the_window_id
    end

  end

  describe "wait_for_condition" do

    it "wait_for_condition wait for a page to load use default timeout when none is specified" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForCondition", ["some javascript", 7000,])
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript"
    end

    it "wait_for_condition wait for a page to load use explicit timeout when specified, converting it to milliseconds" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForCondition", ["some javascript", 24000,])
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript", 24
    end

    it "wait_for_condition timeout can be specified as a string for backward compatibility" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("waitForCondition", ["some javascript", 64000,])
      client.stub!(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript", "64"
    end

  end
  
  describe "wait_for" do

    it "wait_for does nothing when no options are given" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).never
      client.wait_for({})
    end

    it "wait_for waits for page with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_page).with(:the_timeout)
      client.wait_for :wait_for => :page, :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for ajax to complete when ajax option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_ajax)
      client.wait_for :wait_for => :ajax
    end

    it "wait_for waits for ajax to relays javascript framework override" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_ajax).with(hash_including(:javascript_framework => :jquery))
      client.wait_for :wait_for => :ajax, :javascript_framework => :jquery
    end

    it "wait_for waits for ajax with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_ajax).with(hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :ajax, :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for element to be present when element option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_element).with(:the_new_element_id, anything)
      client.wait_for :wait_for => :element, :element => :the_new_element_id
    end

    it "wait_for waits for element with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_element).with(:the_new_element_id, hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :element, :element => :the_new_element_id,
                      :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for no element to be present when no_element option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_element).with(:the_new_element_id, hash_including(:element => :the_new_element_id))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id
    end

    it "wait_for waits for no element with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_element).with(:the_new_element_id, hash_including(:element => :the_new_element_id, :timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id,
                      :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for text to be present when text option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_text).with("some text", hash_including(:element => "a locator", :text => "some text"))
      client.wait_for :wait_for => :text, :element => "a locator", :text => "some text"
    end

    it "wait_for waits for text with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_text).with("some text", hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :text, :text => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for text to NOT be present when no_text option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_text).with("some text", hash_including(:element => 'a_locator'))
      client.wait_for :wait_for => :no_text, :element => 'a_locator', :text => "some text"
    end

    it "wait_for waits for no text with explicit timeout and locator when none are provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_text).with("some text", hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_text, :text => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for effects to complete when effects option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_effects)
      client.wait_for :wait_for => :effects
    end

    it "wait_for waits for effects with explicit timeout when one is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_effects).with(hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :effects, :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for effects to relays javascript framework override" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_effects).with(hash_including(:javascript_framework => :jquery))
      client.wait_for :wait_for => :effects, :javascript_framework => :jquery
    end

    it "wait_for waits for popup to appear when popup option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_popup).with(:the_window_id, nil)
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    it "wait_for for popup uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_popup).with(:the_window_id, :the_timeout)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :timeout_in_seconds => :the_timeout
    end

    it "wait_for for popup also selects the popup when the select option is true" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_popup).with(:the_window_id, nil)
      client.should_receive(:select_window).with(:the_window_id)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :select => true
    end

    it "wait_for for popup does not select the popup when the select option is false" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_popup).with(:the_window_id, nil)
      client.should_receive(:select_window).with(:the_window_id).never
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    it "wait_for waits for field value when value option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :value, :element => :the_locator, :value => :expected_value
    end
  
    it "wait_for for field value uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_field_value).with(:the_locator, 
          :expected_value, 
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :value, :element => :the_locator, 
                                           :value => :expected_value, 
                                           :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for no field value when value option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :no_value, :element => :the_locator, :value => :expected_value
    end
  
    it "wait_for for no field value uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_no_field_value).with(:the_locator, 
          :expected_value, 
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_value, :element => :the_locator, 
                                              :value => :expected_value, 
                                              :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for element to be visible when visible option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :visible, :element => :the_locator, :value => :expected_value
    end

    it "wait_for for visible uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_visible).with(:the_locator, 
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :visible, :element => :the_locator, 
                                             :timeout_in_seconds => :the_timeout
    end

    it "wait_for waits for element to not be visible when visible option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_not_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :not_visible, :element => :the_locator, :value => :expected_value
    end

    it "wait_for for not visible uses explicit timeout when provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_not_visible).with(:the_locator, 
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :not_visible, :element => :the_locator, 
                                                 :timeout_in_seconds => :the_timeout
    end
  
    it "wait_for waits for some javascript to be true when condition option is provided" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:wait_for_condition).with("some javascript", nil)
      client.wait_for :wait_for => :condition, :javascript => "some javascript"
    end

  end

  it "body_text returns the result of the getBodyText command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getBodyText").and_return(:the_text)
    client.body_text.should == :the_text
  end

  it "click just clicks on an element when no options are given" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("click", [:the_locator,])
    client.click :the_locator
  end

  it "click calls wait_for with options provided" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("click", [:the_locator,])
    client.should_receive(:wait_for).with(:wait_for => :page)
    client.click :the_locator, :wait_for => :page
  end

  it "value returns the result of the getValue command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getValue", [:the_locator,]).and_return(:the_value)
    client.value(:the_locator).should == :the_value
  end

  it "field returns the result of the getValue command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getValue", [:the_locator,]).and_return(:the_value)
    client.field(:the_locator).should == :the_value
  end

  it "checked? returns the result of the isChecked command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isChecked", [:the_locator,]).and_return(:the_value)
    client.checked?(:the_locator).should == :the_value
  end

  it "text? returns the result of the isTextPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isTextPresent", [:the_pattern,]).and_return(:the_result)
    client.text?(:the_pattern).should == :the_result
  end

  it "element? returns the result of the isElementPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isElementPresent", [:the_locator,]).and_return(:the_result)
    client.element?(:the_locator).should == :the_result
  end

  it "visible? returns the result of the isTextPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isVisible", [:the_locator,]).and_return(:the_result)
    client.visible?(:the_locator).should == :the_result
  end

  it "alert? returns the result of the isAlertPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isAlertPresent").and_return(:the_result)
    client.alert?.should == :the_result
  end

  it "alert returns the result of the getAlert command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getAlert").and_return(:the_result)
    client.alert.should == :the_result
  end

  it "confirmation? returns the result of the isConfirmationPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isConfirmationPresent").and_return(:the_result)
    client.confirmation?.should == :the_result
  end

  it "confirmation returns the result of the getConfirmation command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getConfirmation").and_return(:the_result)
    client.confirmation.should == :the_result
  end

  it "prompt? returns the result of the isPromptPresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isPromptPresent").and_return(:the_result)
    client.prompt?.should == :the_result
  end

  it "prompt returns the result of the getPrompt command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getPrompt").and_return(:the_result)
    client.prompt.should == :the_result
  end

  it "prompt returns the result of the getEval command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getEval", [:the_script,]).and_return(:the_result)    
    client.js_eval(:the_script).should == :the_result
  end
  
  it "table_cell_text returns the result of the getTable command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getTable", [:the_cell_address,]).and_return(:the_value)
    client.table_cell_text(:the_cell_address).should == :the_value
  end

  it "cookies returns the result of the getCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getCookie").and_return(:the_value)
    client.cookies.should == :the_value
  end

  it "cookie returns the result of the getCookieByName command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getCookieByName", [:the_name,]).and_return(:the_value)
    client.cookie(:the_name).should == :the_value
  end

  it "cookie? returns the result of the isCookiePresent command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:boolean_command).with("isCookiePresent", [:the_name,]).and_return(:the_value)
    client.cookie?(:the_name).should == :the_value
  end

  it "create_cookie returns the result of the createCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("createCookie", [:the_name_value_pair, "options"]).and_return(:the_value)
    client.create_cookie(:the_name_value_pair, "options").should == :the_value
  end

  it "options are optional for create_cookie" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("createCookie", [:the_name_value_pair, ""]).and_return(:the_value)
    client.create_cookie(:the_name_value_pair).should == :the_value
  end

  it "create_cookie take options has a hash" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with do |cmd, args|
      cmd.should == "createCookie"
      
      args.size.should == 2
      args.first.should == :the_name_value_pair
      [ "max_age=60, domain=.foo.com", 
        "domain=.foo.com, max_age=60"  ].should include(args.last)
    end.and_return(:the_value)
      
    result = client.create_cookie(:the_name_value_pair, {:max_age => 60, :domain => ".foo.com"})
    result.should == :the_value
  end

  it "delete_cookie returns the result of the createCookie command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("deleteCookie", [:the_name, "options"]).and_return(:the_value)
    client.delete_cookie(:the_name, "options").should == :the_value
  end

  it "options are optional for delete_cookie" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("deleteCookie", [:the_name, ""]).and_return(:the_value)
    client.delete_cookie(:the_name).should == :the_value
  end

  it "delete_cookie take options has a hash" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("deleteCookie", [:the_name, "domain=.foo.com, max_age=60"]).and_return(:the_value)
    result = client.delete_cookie(:the_name, {:max_age => 60, :domain => ".foo.com"})
    result.should == :the_value
  end
  
  it "all_window_ids returns the result of the getAllWindowIds command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_array_command).with("getAllWindowIds").and_return(:the_value)
    client.all_window_ids.should == :the_value
  end

  it "all_window_names returns the result of the getAllWindowNames command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_array_command).with("getAllWindowNames").and_return(:the_value)
    client.all_window_names.should == :the_value
  end

  it "all_window_titles returns the result of the getAllWindowTitles command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_array_command).with("getAllWindowTitles").and_return(:the_value)
    client.all_window_titles.should == :the_value
  end

  describe "browser_network_traffic" do

    it "browser_network_traffic returns the result of the captureNetworkTraffic command" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("captureNetworkTraffic", ["json"]).and_return(:the_value)
      client.browser_network_traffic(:json).should == :the_value
    end

    it "browser_network_traffic format default to plain" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      client.should_receive(:remote_control_command).with("captureNetworkTraffic", ["plain"]).and_return(:the_value)
      client.browser_network_traffic.should == :the_value
    end

    it "browser_network_traffic raises when format is nil" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      lambda { client.browser_network_traffic(nil) }.should raise_error(RuntimeError)
    end

    it "browser_network_traffic raises when format is not :plain, :json or :xml" do
      client = Class.new { include Selenium::Client::Idiomatic }.new
      lambda { client.browser_network_traffic(:random_format) }.should raise_error(RuntimeError)
    end

  end

  it "browser_xpath_library= invokes the useXpathLibrary command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("useXpathLibrary", ["ajaxslt"]).and_return(:the_value)
    client.browser_xpath_library = :ajaxslt
  end

  it "browser_xpath_library= raises whe library name is not :ajaxslt, :javascript-xpath, or :default" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    lambda { client.browser_xpath_library = :random_library }.should raise_error(RuntimeError)
  end

  it "setting highlight_located_element to true enables auto-hilighting in selenium core" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = true")
    client.highlight_located_element = true
  end

  it "setting highlight_located_element to false disables auto-hilighting in selenium core" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = false")
    client.highlight_located_element = false
  end

  it "execution_delay returns the result of the getSpeed command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:string_command).with("getSpeed").and_return(:the_speed)
    client.execution_delay.should == :the_speed
  end

  it "execution_delay= executes the setSpeed command" do
    client = Class.new { include Selenium::Client::Idiomatic }.new
    client.should_receive(:remote_control_command).with("setSpeed", [24])
    client.execution_delay= 24
  end

end