#!/usr/bin/env ruby

# Copyright 2006 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#


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
		assert(@selenium.is_text_present("suggest"))

		element_id = "document.forms[0].elements[2]"
		@selenium.type element_id, "foo"
		@selenium.set_cursor_position element_id, -1
		@selenium.key_down element_id, 120
		@selenium.key_up element_id, 120
		sleep 2
		assert(@selenium.is_text_present("regexp:foox?1"))
    end
end