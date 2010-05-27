module Selenium
  module WebDriver
    module SpecSupport
      class JRubyTestEnvironment < TestEnvironment

        def app_server
          @app_server ||= in_process_test_environment.appServer
        end

        def remote_server
          @remote_server ||= begin
            puts "starting remote server"

            # ugh - got to be a better way
            [
              Dir["third_party/java/json/*.jar"],
              Dir["third_party/java/jasper/*.jar"],
              Dir["third_party/java/commons-logging/*.jar"],
              Dir["third_party/java/commons-httpclient/*.jar"],
              Dir["third_party/java/commons-codec/*.jar"],
              Dir["third_party/java/google-collect/*.jar"],
            ].flatten.each { |jar| require jar }

            context = org.mortbay.jetty.servlet.Context.new
            context.setContextPath("/")
            context.addServlet("org.openqa.selenium.remote.server.DriverServlet", "/*")

            server  = org.mortbay.jetty.Server.new(6000)
            server.setHandler context

            server
          end
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
          @in_process_test_environment ||= begin
            puts "creating InProcessTestEnvironment"
            org.openqa.selenium.environment.InProcessTestEnvironment.new
          end
        end

      end # JRubyTestEnvironmnet
    end # SpecSupport
  end # WebDriver
end # Selenium