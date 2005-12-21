require File.dirname(__FILE__) + "/../../vendor/selenium/seletest"

class RailsExampleTest < Test::Unit::TestCase

    # Update server_info with your host and port
    def server_info
        ['localhost', 3000]
    end


    def test_installation
        open '/'
        verify_text_present "Welcome aboard"
    end
end