require File.expand_path("../spec_helper", __FILE__)

describe Selenium::Client::Extensions do
  class ExtensionsClient
    include Selenium::Client::Extensions
  end

  let(:client) { ExtensionsClient.new }

  describe "#wait_for_text" do
    it "waits for the innerHTML content of an element when a locator is provided" do
      client.should_receive(:wait_for_condition).with(/findElement\('a_locator'\)/, anything)
      client.wait_for_text "some text", :element => "a_locator"
    end

    it "waits for the page content when no locator is provided" do
      client.should_receive(:wait_for_condition).with(%r{document.body.innerHTML.match\(/some text/\)}m, anything)
      client.wait_for_text "some text"
    end

    it "waits for the page content regexp when no locator is provided" do
      client.should_receive(:wait_for_condition).with(%r{document.body.innerHTML.match\(/some text/\)}m, anything)
      client.wait_for_text(/some text/)
    end

    it "uses default timeout when none is provided" do
      client.should_receive(:wait_for_condition).with(anything, nil)
      client.wait_for_text "some text"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :explicit_timeout)
      client.wait_for_text "some text", :timeout_in_seconds => :explicit_timeout
    end
  end

  describe "#wait_for_no_text" do
    it "waits for the innerHTML content of an element when a locator is provided" do
      client.should_receive(:wait_for_condition).with(/findElement\('a_locator'\)/, anything)
      client.wait_for_no_text "some text", :element => "a_locator"
    end

    it "waits for the page content for regexp when no locator is provided" do
      client.should_receive(:wait_for_condition).with(%r{document.body.innerHTML.match\(/some text/\)}m, anything)
      client.wait_for_no_text(/some text/)
    end

    it "waits for the page content when no locator is provided" do
      client.should_receive(:wait_for_condition).with(%r{document.body.innerHTML.match\(/some text/\)}m, anything)
      client.wait_for_no_text "some text"
    end

    it "uses default timeout when none is provided" do
      client.should_receive(:wait_for_condition).with(anything, nil)
      client.wait_for_no_text "some text"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :explicit_timeout)
      client.wait_for_no_text "some text", :timeout_in_seconds => :explicit_timeout
    end
  end

  describe "#wait_for_ajax" do
    it "uses Ajax.activeRequestCount when default js framework is prototype" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with("selenium.browserbot.getCurrentWindow().Ajax.activeRequestCount == 0;", anything)
      client.wait_for_ajax
    end

    it "uses jQuery.active when default js framework is jQuery" do
      client.stub!(:default_javascript_framework).and_return(:jquery)
      client.should_receive(:wait_for_condition).with("selenium.browserbot.getCurrentWindow().jQuery.active == 0;", anything)
      client.wait_for_ajax
    end

    it "can override default js framework" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with("selenium.browserbot.getCurrentWindow().jQuery.active == 0;", anything)
      client.wait_for_ajax :javascript_framework => :jquery
    end

    it "uses default timeout when none is provided" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with(anything, nil)
      client.wait_for_ajax
    end

    it "uses explicit timeout when provided" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with(anything, :explicit_timeout)
      client.wait_for_ajax :timeout_in_seconds => :explicit_timeout
    end

  end

  describe "#wait_for_effect" do
    it "uses Effect.Queue.size() when default js framework is prototype" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with("selenium.browserbot.getCurrentWindow().Effect.Queue.size() == 0;", anything)
      client.wait_for_effects
    end

    it "uses default timeout when none is provided" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with(anything, nil)
      client.wait_for_effects
    end

    it "uses explicit timeout when provided" do
      client.stub!(:default_javascript_framework).and_return(:prototype)
      client.should_receive(:wait_for_condition).with(anything, :explicit_timeout)
      client.wait_for_effects :timeout_in_seconds => :explicit_timeout
    end
  end

  describe "#wait_for_field_value" do
    it "uses provided locator" do
      client.should_receive(:wait_for_condition).with(/findElement\('a_locator'\)/, anything)
      client.wait_for_field_value "a_locator", "a value"
    end

    it "uses provided field value" do
      client.should_receive(:wait_for_condition).with(/element.value == 'a value'/, anything)
      client.wait_for_field_value "a_locator", "a value"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :the_timeout)
      client.wait_for_field_value "a_locator", "a value", :timeout_in_seconds => :the_timeout
    end
  end

  describe "#wait_for_no_field_value" do
    it "uses provided locator" do
      client.should_receive(:wait_for_condition).with(/findElement\('a_locator'\)/, anything)
      client.wait_for_no_field_value "a_locator", "a value"
    end

    it "uses provided field value" do
      client.should_receive(:wait_for_condition).with(/element.value != 'a value'/, anything)
      client.wait_for_no_field_value "a_locator", "a value"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :the_timeout)
      client.wait_for_no_field_value "a_locator", "a value", :timeout_in_seconds => :the_timeout
    end
  end

  describe "#wait_for_visible" do
    it "uses provided locator" do
      client.should_receive(:wait_for_condition).with("selenium.isVisible('a_locator')", anything)
      client.wait_for_visible "a_locator"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :the_timeout)
      client.wait_for_visible "a_locator", :timeout_in_seconds => :the_timeout
    end
  end

  describe "#wait_for_not_visible" do
    it "uses provided locator" do
      client.should_receive(:wait_for_condition).with("!selenium.isVisible('a_locator')", anything)
      client.wait_for_not_visible "a_locator"
    end

    it "uses explicit timeout when provided" do
      client.should_receive(:wait_for_condition).with(anything, :the_timeout)
      client.wait_for_not_visible "a_locator", :timeout_in_seconds => :the_timeout
    end
  end
end
