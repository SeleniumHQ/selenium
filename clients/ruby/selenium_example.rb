#!/usr/bin/env ruby

require 'seletest'
require 'selenium'

class ExampleTest < Test::Unit::TestCase

	def setup
		super
	end

    def test_something
    	start "*firefox", "http://www.irian.at"
        open "http://www.irian.at/myfaces-sandbox/inputSuggestAjax.jsf"
		verify_text_present "suggest"
		type "_idJsp0:_idJsp3", "foo"
		key_down "_idJsp0:_idJsp3", 120
		key_press "_idJsp0:_idJsp3", 120
		sleep 2
		verify_text_present "foo1"
    end
end