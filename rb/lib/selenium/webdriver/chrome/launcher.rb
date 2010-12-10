module Selenium
  module WebDriver
    module Chrome

      # @api private
      class Launcher
        include FileUtils

        attr_reader :pid

        def initialize(opts = {})
          @default_profile = opts[:default_profile]
          @secure_ssl = !!opts[:secure_ssl]
        end

        def self.binary_path
          @binary_path ||= (
            path = possible_paths.find { |f| File.exist?(f) }
            path || raise(Error::WebDriverError, "Could not find Chrome binary. Make sure Chrome is installed (OS: #{Platform.os})")
          )
        end

        #
        # @api private
        #
        # @see Chrome.path=
        #

        def self.binary_path=(path)
          Platform.assert_executable(path)
          @binary_path = path
        end

        def launch(server_url)
          create_extension
          create_profile
          launch_chrome server_url

          pid
        end

        def quit
          @process.stop
        end

        private

        def create_extension
          # TODO: find a better way to do this
          rm_rf tmp_extension_dir
          mkdir_p File.dirname(tmp_extension_dir), :mode => 0700
          cp_r ext_path, tmp_extension_dir
        end

        def create_profile
          touch "#{tmp_profile_dir}/First Run"
          touch "#{tmp_profile_dir}/First Run Dev"
        end

        def launch_chrome(server_url)
          path = self.class.binary_path

          args = [
            Platform.wrap_in_quotes_if_necessary(path),
            "--load-extension=#{Platform.wrap_in_quotes_if_necessary(tmp_extension_dir)}",
            "--activate-on-launch",
            "--disable-hang-monitor",
            "--disable-popup-blocking",
            "--disable-prompt-on-repost"
          ]

          unless @default_profile
            args << "--user-data-dir=#{Platform.wrap_in_quotes_if_necessary(tmp_profile_dir)}"
          end

          unless @secure_ssl
            args << "--ignore-certificate-errors"
          end

          args << server_url

          @process = ChildProcess.build(*args)
          @process.io.inherit! if $DEBUG

          @process.start
        end

        def ext_path
          @ext_path ||= Zipper.unzip("#{WebDriver.root}/selenium/webdriver/chrome/extension.zip")
        end

        def tmp_extension_dir
          @tmp_extension_dir ||= (
            dir = Dir.mktmpdir("webdriver-chrome-extension")
            Platform.make_writable(dir)
            FileReaper << dir

            dir
          )
        end

        def tmp_profile_dir
          @tmp_profile_dir ||= (
            dir = Dir.mktmpdir("webdriver-chrome-profile")
            Platform.make_writable(dir)
            FileReaper << dir

            dir
          )
        end

        class << self
          def possible_paths
            case Platform.os
            when :windows
              windows_paths
            when :macosx
              macosx_paths
            when :unix, :linux
              unix_paths
            else
              raise "unknown OS: #{Platform.os}"
            end
          end

          def unix_paths
            [
              Platform.find_binary("google-chrome"),
              Platform.find_binary("chromium"),
              Platform.find_binary("chromium-browser"),
              "/usr/bin/google-chrome"
            ].compact
          end

          def macosx_paths
            [
             "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
             "#{Platform.home}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            ]
          end

          def windows_paths
            paths = [
              windows_registry_path,
              "#{ENV['USERPROFILE']}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
              "#{ENV['USERPROFILE']}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
              "#{Platform.home}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
              "#{Platform.home}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
            ].compact

            paths.map! { |path| Platform.cygwin_path(path) } if Platform.cygwin?

            paths
          end

          def windows_registry_path
            require "win32/registry"

            reg = Win32::Registry::HKEY_LOCAL_MACHINE.open(
              "SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe")

            reg[""]
          rescue LoadError
            # older JRuby and IronRuby does not have win32/registry
            nil
          rescue Win32::Registry::Error
            nil
          end
        end # class << self

      end # Launcher
    end # Chrome
  end # WebDriver
end # Selenium
