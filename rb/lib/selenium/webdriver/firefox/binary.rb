module Selenium
  module WebDriver
    module Firefox

      # @api private
      class Binary

        NO_FOCUS_LIBRARY_NAME = "x_ignore_nofocus.so"
        NO_FOCUS_LIBRARIES    = [
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/amd64/#{NO_FOCUS_LIBRARY_NAME}", "amd64/#{NO_FOCUS_LIBRARY_NAME}"],
          ["#{WebDriver.root}/selenium/webdriver/firefox/native/linux/x86/#{NO_FOCUS_LIBRARY_NAME}", "x86/#{NO_FOCUS_LIBRARY_NAME}"],
        ]

        WAIT_TIMEOUT = 90
        QUIT_TIMEOUT = 5

        def start_with(profile, profile_path, *args)
          profile_path = profile_path.gsub("/", "\\") if Platform.windows?

          ENV['XRE_CONSOLE_LOG']           = profile.log_file if profile.log_file
          ENV['XRE_PROFILE_PATH']          = profile_path
          ENV['MOZ_NO_REMOTE']             = '1' # able to launch multiple instances
          ENV['MOZ_CRASHREPORTER_DISABLE'] = '1' # disable breakpad
          ENV['NO_EM_RESTART']             = '1' # prevent the binary from detaching from the console

          if Platform.linux? && (profile.native_events? || profile.load_no_focus_lib?)
            modify_link_library_path profile_path
          end

          execute(*args)
          cope_with_mac_strangeness(args) if Platform.mac?
        end

        def quit
          return unless @process
          @process.poll_for_exit QUIT_TIMEOUT
        rescue ChildProcess::TimeoutError
          # ok, force quit
          @process.stop QUIT_TIMEOUT
        end

        def wait
          @process.poll_for_exit(WAIT_TIMEOUT) if @process
        end

        private

        def execute(*extra_args)
          args = [self.class.path, "-no-remote"] + extra_args
          @process = ChildProcess.build(*args)
          @process.io.inherit! if $DEBUG
          @process.start
        end

        def cope_with_mac_strangeness(args)
          sleep 0.3

          if @process.crashed?
            # ok, trying a restart
            sleep 7
            execute(*args)
          end

          # ensure we're ok
          sleep 0.3
          if @process.crashed?
            raise Error::WebDriverError, "unable to start Firefox cleanly, args: #{args.inspect}"
          end
        end

        def modify_link_library_path(profile_path)
          paths = []

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

          #
          # @api private
          #
          # @see Firefox.path=
          #

          def path=(path)
            Platform.assert_executable(path)
            @path = path
          end

          def path
            @path ||= case Platform.os
                      when :macosx
                        macosx_path
                      when :windows
                        windows_path
                      when :linux, :unix
                        Platform.find_binary("firefox3", "firefox2", "firefox") || "/usr/bin/firefox"
                      else
                        raise Error::WebDriverError, "unknown platform: #{Platform.os}"
                      end

            @path = Platform.cygwin_path(@path) if Platform.cygwin?

            unless File.file?(@path.to_s)
              raise Error::WebDriverError, "Could not find Firefox binary (os=#{Platform.os}). Make sure Firefox is installed or set the path manually with #{self}.path="
            end

            @path
          end

          private

          def windows_path
            windows_registry_path || likely_windows_path || Platform.find_binary("firefox")
          end

          def macosx_path
            path = "/Applications/Firefox.app/Contents/MacOS/firefox-bin"
            path = Platform.find_binary("firefox-bin") unless File.exist?(path)

            path
          end

          def windows_registry_path
            require 'win32/registry'

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

          def likely_windows_path
            [
              "#{ ENV['PROGRAMFILES'] || "\\Program Files" }\\Mozilla Firefox\\firefox.exe",
              "#{ ENV['ProgramFiles(x86)'] || "\\Program Files (x86)" }\\Mozilla Firefox\\firefox.exe"
            ].find { |path| File.executable?(path) }
          end
        end # class << self

      end # Binary
    end # Firefox
  end # WebDriver
end # Selenium
