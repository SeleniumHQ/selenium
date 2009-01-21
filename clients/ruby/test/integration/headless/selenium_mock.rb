#!/usr/bin/env ruby
require File.expand_path(File.dirname(__FILE__) + "/../../test_helper")

class MockTest < Test::Unit::TestCase
  attr_reader :selenium

	def setup
    @selenium = Selenium::SeleniumDriver.new("localhost", 4444, "*mock", "http://localhost:4444", 10000);
    selenium.start
  end
    
  def teardown
    selenium.stop
  end

  def test_something
		selenium.open "/selenium-server/tests/html/test_i18n.html"
		selenium.click "foo"
		assert_equal "x", selenium.title
		assert selenium.alert?;
		links = selenium.get_all_links
		assert_equal [ "1" ], links
		fields = selenium.get_all_fields
		assert_equal ["1", "2", "3"], fields
  end
  
end