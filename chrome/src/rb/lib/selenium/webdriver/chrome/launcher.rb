module Selenium
  module WebDriver
    module Chrome

      # @private
      class Launcher
        include FileUtils

        attr_reader :pid

        def self.launcher
          launcher =  case Platform.os
                      when :windows
                        WindowsLauncher.new
                      when :macosx
                        MacOSXLauncher.new
                      when :unix, :linux
                        UnixLauncher.new
                      else
                        raise "unknown OS: #{Platform.os}"
                      end

          launcher
        end

        def self.binary_path
          @binary_path ||= (
            path = possible_paths.find { |f| File.exist?(f) }
            path || raise(Error::WebDriverError, "Could not find Chrome binary. Make sure Chrome is installed (OS: #{Platform.os})")
          )
        end

        def launch(server_url)
          create_extension
          create_profile
          launch_chrome server_url

          pid
        end

        def quit
          @process.ensure_death
        end

        private

        def create_extension
          # TODO: find a better way to do this
          rm_rf tmp_extension_dir
          mkdir_p File.dirname(tmp_extension_dir), :mode => 0700
          cp_r ext_path, tmp_extension_dir

          if Platform.win?
            cp linked_lib_path, tmp_extension_dir
            mv "#{tmp_extension_dir}/manifest-win.json", "#{tmp_extension_dir}/manifest.json"
          else
            mv "#{tmp_extension_dir}/manifest-nonwin.json", "#{tmp_extension_dir}/manifest.json"
          end
        end

        def create_profile
          touch "#{tmp_profile_dir}/First Run"
          touch "#{tmp_profile_dir}/First Run Dev"
        end

        def launch_chrome(server_url)
          @process = ChildProcess.new Platform.wrap_in_quotes_if_necessary(self.class.binary_path),
                                      "--load-extension=#{Platform.wrap_in_quotes_if_necessary tmp_extension_dir}",
                                      "--user-data-dir=#{Platform.wrap_in_quotes_if_necessary tmp_profile_dir}",
                                      "--activate-on-launch",
                                      "--disable-hang-monitor",
                                      "--disable-popup-blocking",
                                      "--disable-prompt-on-repost",
                                      server_url
          @process.start
        end

        def ext_path
          @ext_path ||= "#{WebDriver.root}/chrome/src/extension"
        end

        def tmp_extension_dir
          @tmp_extension_dir ||= begin
            dir = Dir.mktmpdir("webdriver-chrome-extension")
            Platform.make_writable(dir)
            FileReaper << dir

            dir
          end
        end

        def tmp_profile_dir
          @tmp_profile_dir ||= begin
            dir = Dir.mktmpdir("webdriver-chrome-profile")
            Platform.make_writable(dir)
            FileReaper << dir

            dir
          end
        end

        class WindowsLauncher < Launcher
          def self.possible_paths
            [
              registry_path,
              "#{ENV['USERPROFILE']}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
              "#{ENV['USERPROFILE']}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
              "#{Platform.home}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
              "#{Platform.home}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
            ].compact
          end

          def self.registry_path
            require "win32/registry"

            reg = Win32::Registry::HKEY_LOCAL_MACHINE.open("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\chrome.exe")
            reg[""]
          rescue LoadError
            # older JRuby and IronRuby does not have win32/registry
            nil
          rescue Win32::Registry::Error
            nil
          end

          def linked_lib_path
            # TODO: x64
            @linked_lib_path ||= "#{WebDriver.root}/chrome/prebuilt/Win32/Release/npchromedriver.dll"
          end
        end

        class UnixLauncher < Launcher
          def self.possible_paths
            [Platform.find_binary("google-chrome"), "/usr/bin/google-chrome"].compact
          end

        end

        class MacOSXLauncher < UnixLauncher
          def self.possible_paths
            ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "#{Platform.home}/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
          end
        end

      end # Launcher
    end # Chrome
  end # WebDriver
end # Selenium