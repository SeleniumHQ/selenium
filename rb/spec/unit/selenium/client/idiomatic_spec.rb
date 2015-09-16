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

require_relative 'spec_helper'

describe Selenium::Client::Idiomatic do
  class IdiomaticClient
    include Selenium::Client::Idiomatic
  end

  let(:client) { IdiomaticClient.new }

  it "has #text is an alias for get_text" do
    expect(client).to receive(:string_command).with("getText", [:the_locator,]).and_return(:the_text)
    expect(client.text(:the_locator)).to eq(:the_text)
  end

  it "#title returns the result of the getTitle command" do
    expect(client).to receive(:string_command).with("getTitle").and_return(:the_title)
    expect(client.title).to eq(:the_title)
  end

  it "#location returns the result of the getLocation command" do
    expect(client).to receive(:string_command).with("getLocation").and_return(:the_location)
    expect(client.location).to eq(:the_location)
  end

  describe "#wait_for_page" do
    it "waits for a page to load, converting seconds timeout to milliseconds" do
      expect(client).to receive(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page 2
    end

    it "waits for a page to load with the default timeout when none is specified" do
      expect(client).to receive(:remote_control_command).with("waitForPageToLoad", [7000,])
      allow(client).to receive(:default_timeout_in_seconds).and_return(7)
      client.wait_for_page
    end

    it "waits for a page to load with a string timeout for backward compatibility" do
      expect(client).to receive(:remote_control_command).with("waitForPageToLoad", [2000,])
      client.wait_for_page "2"
    end

    it "has #wait_for_page_to_load as an alias providing easy transition to people used to the old API" do
      expect(client).to receive(:remote_control_command).with("waitForPageToLoad", [24000,])
      client.wait_for_page_to_load 24
    end
  end

  describe "#wait_for_popup" do
    it "returns the result of the waitForPopUp command" do
      expect(client).to receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 0]).and_return(:the_value)
      expect(client.wait_for_popup(:the_window_id, 0)).to eq(:the_value)
    end

    it "converts the timeout from seconds to milliseconds" do
      expect(client).to receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 3000]).and_return(:the_value)
      expect(client.wait_for_popup(:the_window_id, 3)).to eq(:the_value)
    end

    it "accepts timeout as a string for backward compatibility" do
      expect(client).to receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 5000]).and_return(:the_value)
      expect(client.wait_for_popup(:the_window_id, "5")).to eq(:the_value)
    end

    it "uses the default timeout when none is specified" do
      expect(client).to receive(:remote_control_command).with("waitForPopUp", [:the_window_id, 7000]).and_return(:the_value)
      allow(client).to receive(:default_timeout_in_seconds).and_return(7)
      client.wait_for_popup :the_window_id
    end
  end

  describe "#wait_for_condition" do
    it "waits for a page to load using the default timeout when none is specified" do
      expect(client).to receive(:remote_control_command).with("waitForCondition", ["some javascript", 7000,])
      allow(client).to receive(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript"
    end

    it "waits for a page to load using the given timeout converted to milliseconds" do
      expect(client).to receive(:remote_control_command).with("waitForCondition", ["some javascript", 24000,])
      allow(client).to receive(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript", 24
    end

    it "accepts timeout as a string for backward compatibility" do
      expect(client).to receive(:remote_control_command).with("waitForCondition", ["some javascript", 64000,])
      allow(client).to receive(:default_timeout_in_seconds).and_return(7)
      client.wait_for_condition "some javascript", "64"
    end
  end

  describe "#wait_for" do
    it "does nothing when no options are given" do
      expect(client).to receive(:remote_control_command).never
      client.wait_for({})
    end

    it "waits for page with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_page).with(:the_timeout)
      client.wait_for :wait_for => :page, :timeout_in_seconds => :the_timeout
    end

    it "waits for ajax to complete when ajax option is provided" do
      expect(client).to receive(:wait_for_ajax)
      client.wait_for :wait_for => :ajax
    end

    it "waits for ajax using the given javascript framework override" do
      expect(client).to receive(:wait_for_ajax).with(hash_including(:javascript_framework => :jquery))
      client.wait_for :wait_for => :ajax, :javascript_framework => :jquery
    end

    it "waits for ajax with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_ajax).with(hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :ajax, :timeout_in_seconds => :the_timeout
    end

    it "waits for element to be present when element option is provided" do
      expect(client).to receive(:wait_for_element).with(:the_new_element_id, anything)
      client.wait_for :wait_for => :element, :element => :the_new_element_id
    end

    it "waits for element with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_element).with(:the_new_element_id, hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for           => :element, :element            => :the_new_element_id,
                                                       :timeout_in_seconds => :the_timeout
    end

    it "waits for no element to be present when no_element option is provided" do
      expect(client).to receive(:wait_for_no_element).with(:the_new_element_id, hash_including(:element => :the_new_element_id))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id
    end

    it "waits for no element with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_no_element).with(:the_new_element_id, hash_including(:element => :the_new_element_id, :timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_element, :element => :the_new_element_id,
                      :timeout_in_seconds => :the_timeout
    end

    it "waits for text to be present when text option is provided" do
      expect(client).to receive(:wait_for_text).with("some text", hash_including(:element => "a locator", :text => "some text"))
      client.wait_for :wait_for => :text, :element => "a locator", :text => "some text"
    end

    it "waits for text with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_text).with("some text", hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for           => :text,
                      :text               => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    it "waits for text to NOT be present when no_text option is provided" do
      expect(client).to receive(:wait_for_no_text).with("some text", hash_including(:element => 'a_locator'))
      client.wait_for :wait_for => :no_text, :element => 'a_locator', :text => "some text"
    end

    it "waits for no text with explicit timeout and locator when none are provided" do
      expect(client).to receive(:wait_for_no_text).with("some text", hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_text, :text => "some text",
                      :timeout_in_seconds => :the_timeout
    end

    it "waits for effects to complete when effects option is provided" do
      expect(client).to receive(:wait_for_effects)
      client.wait_for :wait_for => :effects
    end

    it "waits for effects with explicit timeout when one is provided" do
      expect(client).to receive(:wait_for_effects).with(hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :effects, :timeout_in_seconds => :the_timeout
    end

    it "waits for effects using the given javascript framework override" do
      expect(client).to receive(:wait_for_effects).with(hash_including(:javascript_framework => :jquery))
      client.wait_for :wait_for => :effects, :javascript_framework => :jquery
    end

    it "waits for popup to appear when popup option is provided" do
      expect(client).to receive(:wait_for_popup).with(:the_window_id, nil)
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    it "waits for popup with explicit timeout when provided" do
      expect(client).to receive(:wait_for_popup).with(:the_window_id, :the_timeout)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :timeout_in_seconds => :the_timeout
    end

    it "selects the popup when the select option is true" do
      expect(client).to receive(:wait_for_popup).with(:the_window_id, nil)
      expect(client).to receive(:select_window).with(:the_window_id)
      client.wait_for :wait_for => :popup, :window => :the_window_id, :select => true
    end

    it "does not select the popup when the select option is false" do
      expect(client).to receive(:wait_for_popup).with(:the_window_id, nil)
      expect(client).to receive(:select_window).with(:the_window_id).never
      client.wait_for :wait_for => :popup, :window => :the_window_id
    end

    it "waits for field value when value option is provided" do
      expect(client).to receive(:wait_for_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :value, :element => :the_locator, :value => :expected_value
    end

    it "waits for field using explicit timeout when provided" do
      expect(client).to receive(:wait_for_field_value).with(:the_locator, :expected_value,
                                                        hash_including(:timeout_in_seconds => :the_timeout))

      client.wait_for :wait_for => :value, :element => :the_locator,
                                           :value   => :expected_value,
                                           :timeout_in_seconds => :the_timeout
    end

    it "waits for no field value when value option is provided" do
      expect(client).to receive(:wait_for_no_field_value).with(:the_locator, :expected_value, anything)
      client.wait_for :wait_for => :no_value, :element => :the_locator, :value => :expected_value
    end

    it "waits for no field value using explicit timeout when provided" do
      expect(client).to receive(:wait_for_no_field_value).with(:the_locator,
          :expected_value,
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :no_value, :element => :the_locator,
                                              :value => :expected_value,
                                              :timeout_in_seconds => :the_timeout
    end

    it "waits for element to be visible when visible option is provided" do
      expect(client).to receive(:wait_for_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :visible, :element => :the_locator, :value => :expected_value
    end

    it "waits for element to be visible using explicit timeout when provided" do
      expect(client).to receive(:wait_for_visible).with(:the_locator,
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :visible, :element => :the_locator,
                                             :timeout_in_seconds => :the_timeout
    end

    it "waits for element to not be visible when visible option is provided" do
      expect(client).to receive(:wait_for_not_visible).with(:the_locator, anything)
      client.wait_for :wait_for => :not_visible, :element => :the_locator, :value => :expected_value
    end

    it "waits for element to not be visible using explicit timeout when provided" do
      expect(client).to receive(:wait_for_not_visible).with(:the_locator,
          hash_including(:timeout_in_seconds => :the_timeout))
      client.wait_for :wait_for => :not_visible, :element => :the_locator,
                                                 :timeout_in_seconds => :the_timeout
    end

    it "waits for given javascript to return true when condition option is provided" do
      expect(client).to receive(:wait_for_condition).with("some javascript", nil)
      client.wait_for :wait_for => :condition, :javascript => "some javascript"
    end
  end

  describe "#body_text" do
    it "returns the result of the getBodyText command" do
      expect(client).to receive(:string_command).with("getBodyText").and_return(:the_text)
      expect(client.body_text).to eq(:the_text)
    end
  end

  describe "#click" do
    it "clicks on an element when no options are given" do
      expect(client).to receive(:remote_control_command).with("click", [:the_locator,])
      client.click :the_locator
    end

    it "calls wait_for with options provided" do
      expect(client).to receive(:remote_control_command).with("click", [:the_locator,])
      expect(client).to receive(:wait_for).with(:wait_for => :page)
      client.click :the_locator, :wait_for => :page
    end
  end

  describe "#value" do
    it "value returns the result of the getValue command" do
      expect(client).to receive(:string_command).with("getValue", [:the_locator,]).and_return(:the_value)
      expect(client.value(:the_locator)).to eq(:the_value)
    end
  end

  describe "#field" do
    it "field returns the result of the getValue command" do
      expect(client).to receive(:string_command).with("getValue", [:the_locator,]).and_return(:the_value)
      expect(client.field(:the_locator)).to eq(:the_value)
    end
  end

  describe "#checked?" do
    it "checked? returns the result of the isChecked command" do
      expect(client).to receive(:boolean_command).with("isChecked", [:the_locator,]).and_return(:the_value)
      expect(client.checked?(:the_locator)).to eq(:the_value)
    end
  end

  describe "#text?" do
    it "returns the result of the isTextPresent command" do
      expect(client).to receive(:boolean_command).with("isTextPresent", [:the_pattern,]).and_return(:the_result)
      expect(client.text?(:the_pattern)).to eq(:the_result)
    end
  end

  describe "#element?" do
    it "returns the result of the isElementPresent command" do
      expect(client).to receive(:boolean_command).with("isElementPresent", [:the_locator,]).and_return(:the_result)
      expect(client.element?(:the_locator)).to eq(:the_result)
    end
  end

  describe "visible?" do
    it "returns the result of the isTextPresent command" do
      expect(client).to receive(:boolean_command).with("isVisible", [:the_locator,]).and_return(:the_result)
      expect(client.visible?(:the_locator)).to eq(:the_result)
    end
  end

  describe "#alert? or #alert" do
    it "returns the result of the isAlertPresent command" do
      expect(client).to receive(:boolean_command).with("isAlertPresent").and_return(:the_result)
      expect(client.alert?).to eq(:the_result)
    end

    it "returns the result of the getAlert command" do
      expect(client).to receive(:string_command).with("getAlert").and_return(:the_result)
      expect(client.alert).to eq(:the_result)
    end
  end

  describe "#confirmation? or #confirmation" do
    it "returns the result of the isConfirmationPresent command" do
      expect(client).to receive(:boolean_command).with("isConfirmationPresent").and_return(:the_result)
      expect(client.confirmation?).to eq(:the_result)
    end

    it "returns the result of the getConfirmation command" do
      expect(client).to receive(:string_command).with("getConfirmation").and_return(:the_result)
      expect(client.confirmation).to eq(:the_result)
    end
  end

  describe "#prompt? and #prompt" do
    it "prompt? returns the result of the isPromptPresent command" do
      expect(client).to receive(:boolean_command).with("isPromptPresent").and_return(:the_result)
      expect(client.prompt?).to eq(:the_result)
    end

    it "prompt returns the result of the getPrompt command" do
      expect(client).to receive(:string_command).with("getPrompt").and_return(:the_result)
      expect(client.prompt).to eq(:the_result)
    end

    it "prompt returns the result of the getEval command" do
      expect(client).to receive(:string_command).with("getEval", [:the_script,]).and_return(:the_result)
      expect(client.js_eval(:the_script)).to eq(:the_result)
    end
  end

  describe "table_cell_text" do
    it "table_cell_text returns the result of the getTable command" do
      expect(client).to receive(:string_command).with("getTable", [:the_cell_address,]).and_return(:the_value)
      expect(client.table_cell_text(:the_cell_address)).to eq(:the_value)
    end
  end

  describe "#cookies, #cookie, #cookie?" do
    it "returns the result of the getCookie command" do
      expect(client).to receive(:string_command).with("getCookie").and_return(:the_value)
      expect(client.cookies).to eq(:the_value)
    end

    it "returns the result of the getCookieByName command" do
      expect(client).to receive(:string_command).with("getCookieByName", [:the_name,]).and_return(:the_value)
      expect(client.cookie(:the_name)).to eq(:the_value)
    end

    it "returns the result of the isCookiePresent command" do
      expect(client).to receive(:boolean_command).with("isCookiePresent", [:the_name,]).and_return(:the_value)
      expect(client.cookie?(:the_name)).to eq(:the_value)
    end
  end

  describe "#create_cookie" do

    it "returns the result of the createCookie command" do
      expect(client).to receive(:remote_control_command).with("createCookie", [:the_name_value_pair, "options"]).and_return(:the_value)
      expect(client.create_cookie(:the_name_value_pair, "options")).to eq(:the_value)
    end

    it "returns the result of the createCookie command when no options are given" do
      expect(client).to receive(:remote_control_command).with("createCookie", [:the_name_value_pair, ""]).and_return(:the_value)
      expect(client.create_cookie(:the_name_value_pair)).to eq(:the_value)
    end

    it "converts hash options to cookie strings" do
      expect(client).to receive(:remote_control_command) { |cmd, args|
        expect(cmd).to eq("createCookie")

        expect(args.size).to eq(2)
        expect(args.first).to eq(:the_name_value_pair)
        expect([ "max_age=60, domain=.foo.com",
          "domain=.foo.com, max_age=60"  ]).to include(args.last)
      }.and_return(:the_value)

      result = client.create_cookie(:the_name_value_pair, {:max_age => 60, :domain => ".foo.com"})
      expect(result).to eq(:the_value)
    end
  end

  describe "#delete_cookie" do
    it "returns the result of the createCookie command" do
      expect(client).to receive(:remote_control_command).with("deleteCookie", [:the_name, "options"]).and_return(:the_value)
      expect(client.delete_cookie(:the_name, "options")).to eq(:the_value)
    end

    it "options are optional for delete_cookie when no options are given" do
      expect(client).to receive(:remote_control_command).with("deleteCookie", [:the_name, ""]).and_return(:the_value)
      expect(client.delete_cookie(:the_name)).to eq(:the_value)
    end

    it "converts hash options to cookie strings" do
      expect(client).to receive(:remote_control_command).with("deleteCookie", [:the_name, "domain=.foo.com, max_age=60"]).and_return(:the_value)
      result = client.delete_cookie(:the_name, {:max_age => 60, :domain => ".foo.com"})
      expect(result).to eq(:the_value)
    end
  end

  describe "#all_window_ids, #all_window_titles or #all_window_names" do
    it "returns the result of the getAllWindowIds command" do
      expect(client).to receive(:string_array_command).with("getAllWindowIds").and_return(:the_value)
      expect(client.all_window_ids).to eq(:the_value)
    end

    it "returns the result of the getAllWindowNames command" do
      expect(client).to receive(:string_array_command).with("getAllWindowNames").and_return(:the_value)
      expect(client.all_window_names).to eq(:the_value)
    end

    it "returns the result of the getAllWindowTitles command" do
      expect(client).to receive(:string_array_command).with("getAllWindowTitles").and_return(:the_value)
      expect(client.all_window_titles).to eq(:the_value)
    end
  end

  describe "#browser_network_traffic" do
    it "returns the result of the captureNetworkTraffic command" do
      expect(client).to receive(:remote_control_command).with("captureNetworkTraffic", ["json"]).and_return(:the_value)
      expect(client.browser_network_traffic(:json)).to eq(:the_value)
    end

    it "uses plain as the default format" do
      expect(client).to receive(:remote_control_command).with("captureNetworkTraffic", ["plain"]).and_return(:the_value)
      expect(client.browser_network_traffic).to eq(:the_value)
    end

    it "raises a RuntimeError when format is nil" do
      expect { client.browser_network_traffic(nil) }.to raise_error(RuntimeError)
    end

    it "raises a RuntimeError when format is an unknown format" do
      expect { client.browser_network_traffic(:random_format) }.to raise_error(RuntimeError)
    end
  end

  describe "#browser_xpath_library=" do
    it "invokes the useXpathLibrary command" do
      expect(client).to receive(:remote_control_command).with("useXpathLibrary", ["ajaxslt"]).and_return(:the_value)
      client.browser_xpath_library = :ajaxslt
    end

    it "raises a RuntimeError whe library name is unknown" do
      expect { client.browser_xpath_library = :random_library }.to raise_error(RuntimeError)
    end
  end

  describe "#highlight_located_element=" do
    it "setting highlight_located_element to true enables auto-hilighting in selenium core" do
      expect(client).to receive(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = true")
      client.highlight_located_element = true
    end

    it "setting highlight_located_element to false disables auto-hilighting in selenium core" do
      expect(client).to receive(:js_eval).with("selenium.browserbot.shouldHighlightLocatedElement = false")
      client.highlight_located_element = false
    end
  end

  describe "#execution_delay or #execution_delay=" do
    it "execution_delay returns the result of the getSpeed command" do
      expect(client).to receive(:string_command).with("getSpeed").and_return(:the_speed)
      expect(client.execution_delay).to eq(:the_speed)
    end

    it "execution_delay= executes the setSpeed command" do
      expect(client).to receive(:remote_control_command).with("setSpeed", [24])
      client.execution_delay= 24
    end
  end
end
