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
    	7899
    end
    def driver_host
    	"localhost"
    end

    def setup
        @processor = Selenium::WebrickCommandProcessor.new(driver_port) do |webrick|
        	mount_directories(webrick)
        end
        @selenium = @processor.proxy

	# TODO: allow configurable, multi-browser execution
        @browser = Selenium::WindowsDefaultBrowserLauncher.new
        
        host, port = server_info
        url = sprintf('http://%s:%s/%s/SeleneseRunner.html?driverhost=%s&driverport=%s', host, port, path_to_runner, driver_host, driver_port)
        @browser.launch(url)
    end
    
    def teardown
        @selenium.test_complete
        @processor.close
        @browser.close
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