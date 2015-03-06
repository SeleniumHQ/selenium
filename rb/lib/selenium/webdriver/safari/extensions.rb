module Selenium
  module WebDriver
    module Safari
      #
      # @api private
      #

      class Extensions

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
              %s
            </array>
            <key>Version</key>
            <integer>1</integer>
          </dict>
          </plist>
        XML

        PLIST_EXTENSION_LINE = <<-XML
          <dict>
            <key>Added Non-Default Toolbar Items</key>
            <array/>
            <key>Archive File Name</key>
            <string>%s.safariextz</string>
            <key>Bundle Directory Name</key>
            <string>%s.safariextension</string>
            <key>Enabled</key>
            <true/>
            <key>Hidden Bars</key>
            <array/>
            <key>Removed Default Toolbar Items</key>
            <array/>
          </dict>
        XML

        def initialize(opts = {})
          @data_dir   = opts.data_dir || safari_data_dir
          @skip       = opts.skip_extension_installation?
          @extensions = opts.extensions
          @backup     = Backup.new
          @installed  = false
        end

        def install
          return if @installed
          installed_extensions = []

          if install_directory.exist?
            @backup.backup install_directory
          end

          install_directory.mkpath

          unless @skip
            extension_destination.rmtree if extension_destination.exist?
            FileUtils.cp extension_source.to_s, extension_destination.to_s

            installed_extensions << extension_destination
          end

          @extensions.each do |extension|
            target = install_directory.join(extension.basename)

            if extension.expand_path == target.expand_path
              @backup.backup(target)
            else
              FileUtils.cp extension, target
            end

            installed_extensions << target
          end

          plist_destination.open('w') do |io|
            extension_lines = installed_extensions.map do |ext|
              name = ext.basename('.safariextz').to_s
              PLIST_EXTENSION_LINE % [name, name]
            end
            io << PLIST % extension_lines.join("\n")
          end

          Platform.exit_hook { uninstall }
          @installed = true
        end

        def uninstall
          return unless @installed

          install_directory.rmtree if install_directory.exist?
          @backup.restore_all

          nil
        ensure
          @installed = false
        end

        def extension_source
          Safari.resource_path.join('SafariDriver.safariextz')
        end

        def extension_destination
          install_directory.join('WebDriver.safariextz')
        end

        def plist_destination
          install_directory.join('Extensions.plist')
        end

        def install_directory
          @install_directory ||= (
            data_dir = Pathname.new(@data_dir || safari_data_dir)

            unless data_dir.exist? && data_dir.directory?
              raise Errno::ENOENT, "Safari data directory not found at #{data_dir.to_s}"
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

        class Backup
          def initialize
            @dir     = Pathname.new(Dir.mktmpdir('webdriver-safari-backups'))
            @backups = {}

            FileReaper << @dir.to_s
          end

          def backup(file)
            src = file
            dst = @dir.join(file.basename).to_s

            FileUtils.cp_r src.to_s, dst.to_s
            @backups[src] = dst
          end

          def restore_all
            @backups.each {|src, dst| FileUtils.cp_r dst.to_s, src.to_s }
          end
        end

      end
    end
  end
end
