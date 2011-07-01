module Selenium
  module WebDriver
    module Opera

      #
      # @api private
      #

      class Bridge < Remote::Bridge

        def initialize(opts = {})
          http_client = opts.delete(:http_client)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          caps = Remote::Capabilities.opera

          @service = Service.default_service
          @service.start

          remote_opts = {
            #:url     => @service.uri,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :opera
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.opera
        end

        def quit
          super
        ensure
          @service.stop
        end

      end
    end
  end
end
