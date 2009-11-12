module Selenium
  module WebDriver
    module Firefox
      class ProfilesIni

        def initialize
          @path = File.join(Util.app_data_path, "profiles.ini")
          @profiles = {}
          parse if File.exist?(@path)
        end

        def [](name)
          @profiles[name]
        end

        def refresh
          @profiles.clear
          parse
        end

        private

        def parse
          string      = File.read @path
          name        = nil
          is_relative = nil
          path        = nil

          string.split("\n").each do |line|
            case line
            when /^\[Profile/
              if p = new_profile(name, is_relative, path)
                @profiles[name] = p
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

          if p = new_profile(name, is_relative, path)
            @profiles[name] = p
          end
        end

        def new_profile(name, is_relative, path)
          return unless [name, path].any?
          path = is_relative ? File.join(Util.app_data_path, path) : path

          Profile.new(path)
        end

      end # ProfilesIni
    end # Firefox
  end # WebDriver
end # Selenium