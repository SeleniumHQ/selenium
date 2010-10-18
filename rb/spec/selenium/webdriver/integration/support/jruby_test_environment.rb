module Selenium
  module WebDriver
    module SpecSupport
      class JRubyTestEnvironment < TestEnvironment

        def app_server
          @app_server ||= in_process_test_environment.appServer
        end

        def url_for(filename)
          app_server.whereIs filename
        end

        def quit
          super
          @in_process_test_environment.stop
          @in_process_test_environment = nil
        end

        private

        def in_process_test_environment
          @in_process_test_environment ||= org.openqa.selenium.environment.InProcessTestEnvironment.new
        end

      end # JRubyTestEnvironmnet
    end # SpecSupport
  end # WebDriver
end # Selenium