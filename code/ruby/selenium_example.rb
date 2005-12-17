#!/usr/bin/env ruby

require 'seletest'
require 'selenium'

class ExampleTest < Test::Unit::TestCase

    def server_info
    	['localhost', 7896]
    end
    def path_to_runner
    	'selenium-driver'
    end
    def mount_directories(webrick)
      # AUT
      webrick.mount("/", Selenium::NonCachingFileHandler, "../javascript/tests/html")

      # Selenium's static files and dynamic handler
      webrick.mount("/selenium-driver", Selenium::NonCachingFileHandler, "../javascript")
    end

    def test_something
        open '/test_click_page1.html'
        verify_text 'link', 'Click here for next page'
        click_and_wait 'link'
        verify_location '/test_click_page2.html'
        click_and_wait 'previousPage'
        verify_element_present 'link'
    end
end