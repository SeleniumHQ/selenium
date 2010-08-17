module Selenium
  module WebDriver
    module Firefox

      # @private
      class Binary

        NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so"
        NO_FOCUS_LIBRARIES = [
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/amd64/#{NO_FOCUS_LIBRARY_NAME}", "amd64/#{NO_FOCUS_LIBRARY_NAME}"],
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/x86/#{NO_FOCUS_LIBRARY_NAME}", "x86/#{NO_FOCUS_LIBRARY_NAME}"],
        ]

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
          ENV['MOZ_NO_REMOTE'] = '1' # able to launch multiple instances

          if Platform.linux? && (profile.native_events? || profile.load_no_focus_lib?)
            modify_link_library_path profile
          end

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

        def modify_link_library_path(profile)
          paths = []
          profile_path = profile.absolute_path

          NO_FOCUS_LIBRARIES.each do |from, to|
            dest = File.join(profile_path, to)
            FileUtils.mkdir_p File.dirname(dest)
            FileUtils.cp from, dest

            paths << File.expand_path(File.dirname(dest))
          end

          paths += ENV['LD_LIBRARY_PATH'].to_s.split(File::PATH_SEPARATOR)

          ENV['LD_LIBRARY_PATH'] = paths.uniq.join(File::PATH_SEPARATOR)
          ENV['LD_PRELOAD']      = NO_FOCUS_LIBRARY_NAME
        end

        class << self
          attr_writer :path

          def path
            @path ||= case Platform.os
                      when :macosx
                        "/Applications/Firefox.app/Contents/MacOS/firefox-bin"
                      when :windows
                        windows_path
                      when :linux, :unix
                        Platform.find_binary("firefox3", "firefox2", "firefox") || "/usr/bin/firefox"
                      else
                        raise Error::WebDriverError, "unknown platform: #{Platform.os}"
                      end

            unless File.file?(@path)
              raise Error::WebDriverError, "Could not find Firefox binary (os=#{Platform.os}). Make sure Firefox is installed or set the path manually with #{self}.path="
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
          rescue Win32::Registry::Error
          end
        end # class << self

      end # Binary
    end # Firefox
  end # WebDriver
end # Selenium
