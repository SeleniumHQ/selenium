module Selenium
  module WebDriver
    module Firefox

      # @private
      class Binary

        def initialize
          ENV['MOZ_NO_REMOTE'] = '1' # able to launch multiple instances
        end

        def create_base_profile(name)
          execute("-CreateProfile", name)

          status = nil
          Timeout.timeout(15, Error::TimeOutError) do
            _, status = wait
          end

          if status && status.to_i != 0
            raise Error::WebDriverError, "could not create base profile: (exit status: #{status})"
          end
        end

        def start_with(profile, *args)
          ENV['XRE_PROFILE_PATH'] = profile.absolute_path
          execute(*args)
          cope_with_mac_strangeness(args) if Platform.mac?
        end

        def execute(*extra_args)
          args = [self.class.path, "-no-remote", "--verbose"] + extra_args
          @process = ChildProcess.new(*args).start
        end

        def cope_with_mac_strangeness(args)
          sleep 0.3

          if @process.ugly_death?
            # process crashed, trying a restart. sleeping 5 seconds shorter than the java driver
            sleep 5
            execute(*args)
          end

          # ensure we're ok
          sleep 0.3
          if @process.ugly_death?
            raise Error::WebDriverError, "unable to start Firefox cleanly, args: #{args.inspect}"
          end
        end

        def quit
          @process.ensure_death if @process
        end

        def kill
          @process.kill if @process
        end

        def wait
          @process.wait if @process
        end

        def pid
          @process.pid if @process
        end

        private

        class << self
          def path
            @path ||= case Platform.os
                      when :macosx
                        "/Applications/Firefox.app/Contents/MacOS/firefox-bin"
                      when :windows
                        windows_path
                      when :linux, :unix
                        Platform.find_binary("firefox3", "firefox2", "firefox") || "/usr/bin/firefox"
                      else
                        raise "Unknown platform: #{Platform.os}"
                      end

            unless File.file?(@path)
              raise Error::WebDriverError, "Could not find Firefox binary. Make sure Firefox is installed (OS: #{Platform.os})"
            end

            @path
          end

          private

          def windows_path
            windows_registry_path || "#{ ENV['PROGRAMFILES'] || "\\Program Files" }\\Mozilla Firefox\\firefox.exe"
          end

          def windows_registry_path
            require "win32/registry"

            lm = Win32::Registry::HKEY_LOCAL_MACHINE
            lm.open("SOFTWARE\\Mozilla\\Mozilla Firefox") do |reg|
              main = lm.open("SOFTWARE\\Mozilla\\Mozilla Firefox\\#{reg.keys[0]}\\Main")
              if entry = main.find { |key, type, data| key =~ /pathtoexe/i }
                return entry.last
              end
            end
          rescue LoadError
            # older JRuby or IronRuby does not have win32/registry
            nil
          rescue Win32::Registry::Error
            raise Error::WebDriverError, "Firefox not found in the Windows registry. Make sure Firefox is installed"
          end
        end # class << self

      end # Binary
    end # Firefox
  end # WebDriver
end # Selenium
