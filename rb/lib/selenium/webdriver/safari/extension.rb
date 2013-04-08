module Selenium
  module WebDriver
    module Safari
      class Extension

        PLIST = <<-XML
          <?xml version="1.0" encoding="UTF-8"?>
          <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
          <plist version="1.0">
          <dict>
            <key>Available Updates</key>
            <dict>
              <key>Last Update Check Time</key>
              <real>370125644.75941497</real>
              <key>Updates List</key>
              <array/>
            </dict>
            <key>Installed Extensions</key>
            <array>
              <dict>
                <key>Added Non-Default Toolbar Items</key>
                <array/>
                <key>Archive File Name</key>
                <string>WebDriver.safariextz</string>
                <key>Bundle Directory Name</key>
                <string>WebDriver.safariextension</string>
                <key>Enabled</key>
                <true/>
                <key>Hidden Bars</key>
                <array/>
                <key>Removed Default Toolbar Items</key>
                <array/>
              </dict>
            </array>
            <key>Version</key>
            <integer>1</integer>
          </dict>
          </plist>
        XML

        def initialize(opts = {})
          @custom_data_dir = opts[:custom_data_dir]
          @installed       = false
        end

        def install
          return if @installed

          if install_directory.exist?
            FileUtils.mv install_directory.to_s, backup_directory.to_s
          end

          install_directory.mkpath

          extension_destination.rmtree if extension_destination.exist?
          FileUtils.cp extension_source.to_s, extension_destination.to_s

          plist_destination.open('w') { |io| io << PLIST }

          at_exit { uninstall }
          @installed = true
        end

        def uninstall
          return unless @installed

          install_directory.rmtree if install_directory.exist?

          if backup_directory.exist?
            FileUtils.mv backup_directory.to_s, install_directory.to_s
          end
        ensure
          @installed = false
        end

        def extension_source
          Safari.resource_path.join('SafariDriver.safariextz')
        end

        def extension_destination
          install_directory.join('WebDriver.safariextz')
        end

        def backup_directory
          Pathname.new("#{install_directory.to_s}.bak")
        end

        def plist_destination
          install_directory.join('Extensions.plist')
        end

        def install_directory
          @install_directory ||= (
            data_dir = Pathname.new(@custom_data_dir || safari_data_dir)

            unless data_dir.exist? && data_dir.directory?
              raise Errno::ENOENT, "Safari data directory not found at #{dir.to_s}"
            end

            data_dir.join('Extensions')
          )
        end

        def safari_data_dir
          current = Platform.os

          case current
          when :macosx
            Pathname.new(Platform.home).join('Library/Safari')
          when :windows
            Pathname.new(ENV['APPDATA']).join('Apple Computer/Safari')
          else
            raise Error::WebDriverError, "unsupported platform: #{current}"
          end
        end

      end
    end
  end
end
