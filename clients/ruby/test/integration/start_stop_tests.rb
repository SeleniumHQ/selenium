#!/usr/bin/env ruby

require File.expand_path(File.dirname(__FILE__) + "/test_helper")

class StartStopTest < Test::Unit::TestCase

	def test_can_call_stop_even_when_session_was_not_started
    @selenium = Selenium::SeleniumDriver.new("localhost", 4444, "*firefox", "http://localhost:4444", 10000);
    @selenium.stop
  end

end