#!/usr/bin/env ruby

require 'seletest'
require 'selenium'

class ExampleTest < Test::Unit::TestCase

    def test_something

        open '/test_click_page1.html'
        verify_text 'link', 'Click here for next page'
        click_and_wait 'link'
        verify_location '/test_click_page2.html'
        click_and_wait 'previousPage'
        verify_element_present 'link'

    end

end