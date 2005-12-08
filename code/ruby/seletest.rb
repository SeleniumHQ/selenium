require 'test/unit'

class Test::Unit::TestCase

    def setup
        @selenium = Selenium::WebrickCommandProcessor.new.proxy
        @browser = Selenium::WindowsDefaultBrowserLauncher.new
        @browser.launch("http://localhost:7896/selenium-driver/SeleneseRunner.html")
    end

    def teardown
        @selenium.test_complete
        @browser.close
    end

    alias file_open open
    def open(*args)
        @selenium.open(*args)
    end

    def method_missing(method, *args)
        @selenium.send(method, *args)
    end
end