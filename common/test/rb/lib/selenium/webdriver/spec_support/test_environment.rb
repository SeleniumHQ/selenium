module Selenium
  module WebDriver
    module SpecSupport
      class TestEnvironment

        attr_accessor :unguarded

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
          @driver_instance.quit if @driver_instance
          @driver_instance = new_driver_instance
        end

        def new_driver_instance
          if driver == :remote
            opts = {
              :desired_capabilities => WebDriver::Remote::Capabilities.send(ENV['WD_REMOTE_BROWSER'] || 'firefox')
            }

            if Platform.jruby?
              # if we're running on JRuby, we're using in-process Jetty on this URL
              opts.merge!(:url => "http://localhost:6000")
            end

            WebDriver::Driver.for :remote, opts
          else
            WebDriver::Driver.for driver
          end
        end

        def app_server
          @app_server ||= begin
            s = RackServer.new("#{WebDriver.root}/common/src/web")
            s.start

            s
          end
        end

        def remote_server
          raise NotImplementedError, "no remote server implementation on MRI yet"
        end

        def quit
          app_server.stop
          @driver_instance = @app_server = @remote_server = nil

          Guards.report
        end

        def unguarded?
          @unguarded ||= false
        end

        def url_for(filename)
          app_server.where_is filename
        end

        private

        #
        # wrap the driver instance in this for a quick and dirty debugging tool
        #

        def wrap_in_tracing_delegator(object)
          delegator = Object.new

          def delegator.method_missing(meth, *args, &blk)
            p :meth => meth, :args => args
            @delegate.send(meth, *args, &blk)
          end

          delegator.instance_variable_set("@delegate", object)
          delegator
        end

      end # TestEnvironment
    end # SpecSupport
  end # WebDriver
end # Selenium
