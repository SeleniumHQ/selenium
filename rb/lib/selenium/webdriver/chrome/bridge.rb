module Selenium
  module WebDriver
    module Chrome

      # @api private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          http_client = opts.delete(:http_client)

          if opts.has_key?(:url)
            url = opts.delete(:url)
          else
            @service = Service.default_service(*extract_service_args(opts))
            @service.start

            url = @service.uri
          end

          caps = create_capabilities(opts)

          remote_opts = {
            :url                  => url,
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
          @service.stop if @service
        end

        private

        def create_capabilities(opts)
          caps                        = opts.delete(:desired_capabilities) { Remote::Capabilities.chrome }
          args                        = opts.delete(:args) || opts.delete(:switches)
          native_events               = opts.delete(:native_events)
          verbose                     = opts.delete(:verbose)
          profile                     = opts.delete(:profile)
          detach                      = opts.delete(:detach)
          proxy                       = opts.delete(:proxy)
          no_website_testing_defaults = opts.delete(:no_website_testing_defaults)

          unless opts.empty?
            raise ArgumentError, "unknown option#{'s' if opts.size != 1}: #{opts.inspect}"
          end

          chrome_options = caps['chromeOptions'] || {}

          if args
            unless args.kind_of? Array
              raise ArgumentError, ":args must be an Array of Strings"
            end

            chrome_options['args'] = args.map { |e| e.to_s }
          end

          if profile
            data = profile.as_json

            chrome_options.merge! 'profile'    => data['zip'],
                                  'extensions' => data['extensions']
          end


          chrome_options['binary']                   = Chrome.path if Chrome.path
          chrome_options['nativeEvents']             = true if native_events
          chrome_options['verbose']                  = true if verbose
          chrome_options['detach']                   = detach.nil? || !!detach
          chrome_options['noWebsiteTestingDefaults'] = true if no_website_testing_defaults

          caps['chromeOptions'] = chrome_options
          caps['proxy'] = proxy if proxy

          # legacy options - for chromedriver < 17.0.963.0
          caps["chrome.switches"] = chrome_options['args'] if chrome_options.member?('args')
          %w[binary detach extensions nativeEvents noWebsiteTestingDefaults profile verbose].each do |key|
            caps["chrome.#{key}"] = chrome_options[key] if chrome_options.member?(key)
          end

          caps
        end

        def extract_service_args(opts)
          args = []

          if opts.has_key?(:service_log_path)
            args << "--log-path=#{opts.delete(:service_log_path)}"
          end

          args
        end

      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
