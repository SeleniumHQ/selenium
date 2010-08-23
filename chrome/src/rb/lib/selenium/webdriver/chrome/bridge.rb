module Selenium
  module WebDriver
    module Chrome

      # @private
      class Bridge < Remote::Bridge

        def initialize(opts = {})
          @launcher = Launcher.launcher(
            :default_profile => opts[:default_profile],
            :secure_ssl      => opts[:secure_ssl]
          )

          @executor = CommandExecutor.new
          @launcher.launch(@executor.uri)
        end

        def browser
          :chrome
        end

        def driver_extensions
          [DriverExtensions::TakesScreenshot]
        end

        def capabilities
          @capabilities ||= Remote::Capabilities.chrome
        end

        def quit
          begin
            super
          rescue IOError
          end

          @executor.close
          @launcher.quit
        end

        def getScreenshot
          execute :screenshot
        end

        def setSpeed(value)
          @speed = value
        end

        def getSpeed
          @speed
        end

        def findElementByCssSelector(parent, selector)
          find_element_by 'css', selector, parent
        end

        def findElementsByCssSelector(parent, selector)
          find_elements_by 'css', selector, parent
        end

        def getAllCookies
          execute :getCookies
        end

        def deleteCookie(name)
          execute :deleteCookie, :name => name
        end

        def setImplicitWaitTimeout(milliseconds)
          execute :implicitlyWait, :ms => milliseconds
        end

        def elementEquals(element, other)
          element.ref == other.ref
        end

        private

        def execute(command_name, opts = {}, args = nil)
          command = {:request => command_name}.merge(opts)
          command.merge!(args) if args

          command = camel_case_keys_in(command)

          puts "--> #{command.inspect}" if $DEBUG
          resp = raw_execute command
          puts "<-- #{resp.inspect}" if $DEBUG

          code = resp['status']
          if e = Error.for_code(code)
            msg = resp['value']['message'] if resp['value']
            msg ||= "unknown exception for #{command.inspect}"
            msg << " (#{code})"

            raise e, msg
          end

          resp['value']
        end

        def raw_execute(command)
          @executor.execute command
        end

        #
        # TODO(jari): fix this in the remote driver
        #

        def camel_case(string)
          parts = string.split('_')
          parts[1..-1].map { |e| e.capitalize! }
          parts.join
        end

        def camel_case_keys_in(hash)
          h = {}

          hash.each do |key, value|
            h[camel_case(key.to_s)] = value
          end

          h
        end

      end # Bridge
    end # Chrome
  end # WebDriver
end # Selenium
