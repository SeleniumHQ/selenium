module Selenium
  module WebDriver
    module Chrome
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

        def launch(server_url)
          create_extension
          create_profile
          launch_chrome server_url

          pid
        end

        def kill
          @process.kill
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
          check_binary_exists
          @process = ChildProcess.new Platform.wrap_in_quotes_if_necessary(binary_path),
                                      "--load-extension=#{Platform.wrap_in_quotes_if_necessary tmp_extension_dir}",
                                      "--user-data-dir=#{Platform.wrap_in_quotes_if_necessary tmp_profile_dir}",
                                      "--activate-on-launch",
                                      "--disable-hang-monitor",
                                      "--disable-popup-blocking",
                                      "--disable-prompt-on-repost",
                                      server_url
          @process.start
        end

        def check_binary_exists
          unless File.file?(binary_path)
            raise Error::WebDriverError, "Could not find Chrome binary. Make sure Chrome is installed (OS: #{Platform.os})"
          end
        end

        def ext_path
          @ext_path ||= "#{WebDriver.root}/chrome/src/extension"
        end

        def tmp_extension_dir
          @tmp_extension_dir ||= begin
            dir = Dir.mktmpdir("webdriver-chrome-extension")
            Platform.make_writable(dir)

            dir
          end
        end

        def tmp_profile_dir
          @tmp_profile_dir ||= begin
            dir = Dir.mktmpdir("webdriver-chrome-profile")
            Platform.make_writable(dir)

            dir
          end
        end

        class WindowsLauncher < Launcher
          def linked_lib_path
            # TODO: x64
            @linked_lib_path ||= "#{WebDriver.root}/chrome/prebuilt/Win32/Release/npchromedriver.dll"
          end

          def binary_path
            @binary_path ||= begin
              possible_paths = [
                "#{ENV['USERPROFILE']}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
                "#{ENV['USERPROFILE']}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
                "#{Platform.home}\\Local Settings\\Application Data\\Google\\Chrome\\Application\\chrome.exe",
                "#{Platform.home}\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe",
              ]

              possible_paths.find { |f| File.exist?(f) } || possible_paths.first
            end
          end

        end

        class UnixLauncher < Launcher
          def binary_path
            @binary_path ||= "/usr/bin/google-chrome"
          end

        end

        class MacOSXLauncher < UnixLauncher
          def binary_path
            @binary_path ||= "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
          end
        end

      end # Launcher
    end # Chrome
  end # WebDriver
end # Selenium