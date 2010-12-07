module Selenium
  module WebDriver
    module Firefox

      # @api private
      class ProfilesIni

        def initialize
          @ini_path = File.join(Util.app_data_path, "profiles.ini")
          @profile_paths = {}

          parse if File.exist?(@ini_path)
        end

        def [](name)
          path = @profile_paths[name]
          path && Profile.new(path)
        end

        def refresh
          @profile_paths.clear
          parse
        end

        private

        def parse
          string      = File.read @ini_path
          name        = nil
          is_relative = nil
          path        = nil

          string.split("\n").each do |line|
            case line
            when /^\[Profile/
              if p = path_for(name, is_relative, path)
                @profile_paths[name] = p
                name, path = nil
              end
            when /^Name=(.+)$/
              name = $1.strip
            when /^IsRelative=(.+)$/
              is_relative = $1.strip == "1"
            when /^Path=(.+)$/
              path = $1.strip
            end
          end

          if p = path_for(name, is_relative, path)
            @profile_paths[name] = p
          end
        end

        def path_for(name, is_relative, path)
          return unless [name, path].any?
          path = is_relative ? File.join(Util.app_data_path, path) : path
        end

      end # ProfilesIni
    end # Firefox
  end # WebDriver
end # Selenium
