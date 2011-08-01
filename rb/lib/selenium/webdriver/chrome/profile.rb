module Selenium
  module WebDriver
    module Chrome

      #
      # @private
      #

      class Profile
        include ProfileHelper

        def initialize(model = nil)
          @model = verify_model(model)
        end

        #
        # Set a preference in the profile.
        #
        # See http://codesearch.google.com/codesearch#OAMlx_jo-ck/src/chrome/common/pref_names.cc&exact_package=chromium
        #

        def []=(key, value)
          parts = key.split(".")
          parts[0..-2].inject(prefs) { |pr, k| pr[k] ||= {} }[parts.last] = value
        end

        def [](key)
          parts = key.split(".")
          parts.inject(prefs) { |pr, k| pr.fetch(k) }
        end

        def layout_on_disk
          dir = @model ? create_tmp_copy(@model) : Dir.mktmpdir("webdriver-chrome-profile")
          FileReaper << dir

          write_prefs_to dir

          dir
        end

        private

        def write_prefs_to(dir)
          prefs_file = prefs_file_for(dir)

          FileUtils.mkdir_p File.dirname(prefs_file)
          File.open(prefs_file, "w") { |file| file << prefs.to_json  }
        end

        def prefs
          @prefs ||= read_model_prefs
        end

        def read_model_prefs
          return {} unless @model
          JSON.parse File.read(prefs_file_for(@model))
        end

        def prefs_file_for(dir)
          File.join dir, 'Default', 'Preferences'
        end
      end # Profile

    end # Chrome
  end # WebDriver
end # Selenium
