module Selenium
  module WebDriver
    module SpecSupport
      class TestEnvironment

        attr_accessor :unguarded

        def initialize
          puts "creating #{self.class} :: #{RUBY_DESCRIPTION}"
        end

        def driver
          # TODO: get rid of ENV
          (ENV['WD_SPEC_DRIVER'] || raise("must set WD_SPEC_DRIVER")).to_sym
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
          if driver == :remote
            opts = {
              :desired_capabilities => WebDriver::Remote::Capabilities.send(ENV['WD_REMOTE_BROWSER'] || 'firefox'),
              :url                  => remote_server.url
            }

            WebDriver::Driver.for :remote, opts
          else
            WebDriver::Driver.for driver
          end
        end

        def app_server
          @app_server ||= begin
            path = File.expand_path("../../../../../../common/src/web", __FILE__)
            s = RackServer.new(path)
            s.start

            s
          end
        end

        def remote_server
          @remote_server ||= RemoteServer.new
        end

        def quit
          app_server.stop

          if defined?(@remote_server)
            @remote_server.stop
          end

          @driver_instance = @app_server = @remote_server = nil

          Guards.report
        end

        def unguarded?
          @unguarded ||= false
        end

        def url_for(filename)
          app_server.where_is filename
        end

      end # TestEnvironment
    end # SpecSupport
  end # WebDriver
end # Selenium
