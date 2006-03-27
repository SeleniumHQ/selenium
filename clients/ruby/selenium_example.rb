#!/usr/bin/env ruby

require 'test/unit'
require 'selenium'

class ExampleTest < Test::Unit::TestCase

	def setup
        @selenium = Selenium::SeleneseInterpreter.new("localhost", 4444, "*firefox", "http://www.irian.at", 10000);
        @selenium.start
    end
    
    def teardown
        @selenium.stop
    end

    def test_something
        @selenium.open "http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf"
		@selenium.assert_text_present "suggest"
		@selenium.type "_idJsp0:_idJsp3", "foo"
		@selenium.key_down "_idJsp0:_idJsp3", 120
		@selenium.key_press "_idJsp0:_idJsp3", 120
		sleep 2
		@selenium.assert_text_present "foo1"
    end
end