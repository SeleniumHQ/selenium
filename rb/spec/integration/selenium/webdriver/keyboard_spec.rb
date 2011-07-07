require File.expand_path("../spec_helper", __FILE__)

module Selenium
  module WebDriver
    describe Keyboard do

      compliant_on :browser => :ie do
        it "sends keys to the active element" do
          driver.navigate.to url_for("bodyTypingTest.html")

          driver.keyboard.send_keys "ab"

          text = driver.find_element(:id => "body_result").text
          text.should == "keypress keypress"

          driver.find_element(:id => "result").text.should be_empty
        end

        it "can send keys with shift pressed" do
          driver.navigate.to url_for("javascriptPage.html")

          event_input = driver.find_element(:id => "theworks")
          keylogger   = driver.find_element(:id => "result")

          driver.mouse.click event_input

          driver.keyboard.press :shift
          driver.keyboard.send_keys "ab"
          driver.keyboard.release :shift

          event_input.attribute(:value).should == "AB"
          keylogger.text.should == "focus keydown keydown keypress keyup keydown keypress keyup keyup"
        end

        it "raises an UnsupportedOperationError if the pressed key is not a modifier key" do
          lambda { driver.keyboard.press :return }.should raise_error(Error::UnsupportedOperationError)
        end

        it "can press and release modifier keys" do
          driver.navigate.to url_for("javascriptPage.html")

          event_input = driver.find_element(:id => "theworks")
          keylogger   = driver.find_element(:id => "result")

          driver.mouse.click event_input

          driver.keyboard.press :shift
          keylogger.text.should =~ /keydown$/

          driver.keyboard.release :shift
          keylogger.text.should =~ /keyup$/
        end
      end

    end # Keyboard
  end # WebDriver
end # Selenium
