require 'test/unit'
require File.dirname(__FILE__) + "/selenium"

class Test::Unit::TestCase

    # hooks to be overriden
    def server_info
        ['localhost', 3000]
    end
    def mount_directories(webrick)
        # sub-classes implement if needed
    end
    def path_to_runner
    	'selenium/javascript'
    end
    def driver_port
    	7896
    end
    def driver_host
    	"localhost"
    end

    def setup
        @selenium = Selenium::SeleneseInterpreter.new("localhost", 4444, 10000);
    end
    
    def teardown
        @selenium.test_complete
    end

    alias file_open open
    def open(*args)
        @selenium.open(*args)
    end

    alias old_type type
    def type(*args)
        @selenium.type(*args)
    end

    alias old_select select
    def select(*args)
        @selenium.select(*args)
    end

    def method_missing(method, *args)
        @selenium.send(method, *args)
    end
end