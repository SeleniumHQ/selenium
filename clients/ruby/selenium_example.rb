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
		@selenium.assert_text_present "suggest"
		@selenium.type "_idJsp0:_idJsp3", "foo"
		@selenium.key_down "_idJsp0:_idJsp3", 120
		@selenium.key_press "_idJsp0:_idJsp3", 120
		sleep 2
		@selenium.assert_text_present "foo1"
    end
end