module Selenium
  module WebDriver
    module SpecSupport
      class TestEnvironment

        attr_accessor :unguarded

        def driver
          # TODO: find a better way to do this
          @driver ||= if $LOAD_PATH.any? { |p| p.include?("remote/client") }
                        :remote
                      elsif $LOAD_PATH.any? { |p| p.include?("jobbie") }
                        :ie
                      elsif $LOAD_PATH.any? { |p| p.include?("chrome") }
                        :chrome
                      elsif $LOAD_PATH.any? { |p| p.include?("firefox") }
                        :firefox
                      else
                        raise "not sure what driver to run specs for"
                      end
        end

        def browser
          if driver == :remote
            # TODO: get rid of ENV
            (ENV['REMOTE_BROWSER_VERSION'] || :firefox).to_sym
          else
            driver
          end
        end

        def driver_instance
          @driver_instance ||= new_driver_instance
        end

        def new_driver_instance
          if driver == :remote
            cap = WebDriver::Remote::Capabilities.send(ENV['REMOTE_BROWSER_VERSION'] || 'firefox')
            WebDriver::Driver.for :remote,  :server_url           => "http://localhost:6000/",
                                            :desired_capabilities => cap
          else
            WebDriver::Driver.for driver
          end
        end

        def app_server
          @app_server ||= begin
            s = RackServer.new
            s.start

            s
          end
        end

        def remote_server
          raise NotImplementedError, "no remote server impl. in ruby/MRI yet"
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
