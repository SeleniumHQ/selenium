module Selenium
  module WebDriver
    module SpecSupport
      class TestEnvironment

        attr_accessor :unguarded
        attr_reader :driver

        def initialize
          puts "creating test env :: #{ruby_description}"

          @create_driver_error       = nil
          @create_driver_error_count = 0

          # TODO: get rid of ENV
          @driver = (ENV['WD_SPEC_DRIVER'] || raise("must set WD_SPEC_DRIVER")).to_sym
        end

        def browser
          if driver == :remote
            # TODO: get rid of ENV
            (ENV['WD_REMOTE_BROWSER'] || :firefox).to_sym
          else
            driver
          end
        end

        def driver_instance
          @driver_instance ||= new_driver_instance
        end

        def reset_driver!
          quit_driver
          @driver_instance = new_driver_instance
        end

        def quit_driver
          @driver_instance.quit if @driver_instance
        end

        def new_driver_instance
          check_for_previous_error
          create_driver
        end

        def app_server
          @app_server ||= (
            path = File.join(root_folder, "common/src/web")
            s = RackServer.new(path)
            s.start

            s
          )
        end

        def remote_server
          @remote_server ||= (
            Selenium::Server.new(remote_server_jar,
              :port       => PortProber.random,
              :log        => !!$DEBUG,
              :background => true,
              :timeout    => 60
            )
          )
        end

        def remote_server_jar
          @remote_server_jar ||= File.join(root_folder, "build/java/server/test/org/openqa/selenium/server-with-tests-standalone.jar")
        end

        def quit
          app_server.stop

          if defined?(@remote_server)
            @remote_server.stop
          end

          @driver_instance = @app_server = @remote_server = nil
        ensure
          Guards.report
        end

        def unguarded?
          @unguarded ||= false
        end

        def url_for(filename)
          app_server.where_is filename
        end

        private

        def ruby_description
          defined?(RUBY_DESCRIPTION) ? RUBY_DESCRIPTION : "ruby-#{RUBY_VERSION}"
        end

        def root_folder
          @root_folder ||= File.expand_path("../../../../../../../", __FILE__)
        end

        def create_driver
          case driver
          when :remote
            begin
              require 'selenium/webdriver/remote/http/persistent'
              STDERR.puts "INFO: using net-http-persistent"
              http_client = Selenium::WebDriver::Remote::Http::Persistent.new
            rescue LoadError # net-http-persistent not available
              http_client = Selenium::WebDriver::Remote::Http::Default.new
            end

            instance = WebDriver::Driver.for(:remote,
              :desired_capabilities => remote_capabilities,
              :url                  => remote_server.webdriver_url,
              :http_client          => http_client
            )
          when :opera
            ENV['SELENIUM_SERVER_JAR'] = remote_server_jar
            instance = WebDriver::Driver.for :opera
          else
            instance = WebDriver::Driver.for driver, :listener => WebDriver::Support::AbstractEventListener.new
          end

          @create_driver_error_count -= 1 unless @create_driver_error_count == 0
          instance
        rescue => ex
          @create_driver_error = ex
          @create_driver_error_count += 1
          raise ex
        end

        def remote_capabilities
          caps  = WebDriver::Remote::Capabilities.send(ENV['WD_REMOTE_BROWSER'] || 'firefox')

          caps.javascript_enabled    = true
          caps.css_selectors_enabled = true

          caps
        end

        MAX_ERRORS = 4

        class DriverInstantiationError < StandardError
        end

        def check_for_previous_error
          return unless @create_driver_error && @create_driver_error_count >= MAX_ERRORS

          msg = "previous #{@create_driver_error_count} instantiations of driver #{driver.inspect} failed, not trying again"
          msg << " (#{@create_driver_error.message})"

          raise DriverInstantiationError, msg, @create_driver_error.backtrace
        end

      end # TestEnvironment
    end # SpecSupport
  end # WebDriver
end # Selenium
