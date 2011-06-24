module Selenium
  module WebDriver
    module Chrome

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          http_client   = opts.delete(:http_client)
          switches      = opts.delete(:switches)
          native_events = opts.delete(:native_events)
          verbose       = opts.delete(:verbose)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          caps = Remote::Capabilities.chrome

          if switches
            unless switches.kind_of? Array
              raise ArgumentError, ":switches must be an Array of Strings"
            end

            caps.merge! 'chrome.switches' => switches.map { |e| e.to_s }
          end

          caps.merge! 'chrome.binary'       => Chrome.path if Chrome.path
          caps.merge! 'chrome.nativeEvents' => true if native_events
          caps.merge! 'chrome.verbose'      => true if verbose

          @service = Service.default_service
          @service.start

          remote_opts = {
            :url                  => @service.uri,
            :desired_capabilities => caps
          }

          remote_opts.merge!(:http_client => http_client) if http_client

          super(remote_opts)
        end

        def browser
          :chrome
        end

        def driver_extensions
          [
            DriverExtensions::TakesScreenshot,
            DriverExtensions::HasInputDevices
          ]
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
