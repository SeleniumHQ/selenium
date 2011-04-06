module Selenium
  module WebDriver
    module Chrome

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          # TODO: pass options to Chrome::Service
          http_client = opts.delete(:http_client)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          @service = Service.default_service
          @service.start

          remote_opts = {
            :url                  => @service.uri,
            :desired_capabilities => :chrome
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :chrome
        end

        def driver_extensions
          []
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.chrome
        end

        def quit
          super
        ensure
          @service.stop
        end

      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
