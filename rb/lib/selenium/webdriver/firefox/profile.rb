module Selenium
  module WebDriver
    module Firefox
      class Profile

        ANONYMOUS_PROFILE_NAME   = "WEBDRIVER_ANONYMOUS_PROFILE"
        EXTENSION_NAME           = "fxdriver@googlecode.com"
        EM_NAMESPACE_URI         = "http://www.mozilla.org/2004/em-rdf#"
        WEBDRIVER_EXTENSION_PATH = File.expand_path("#{WebDriver.root}/selenium/webdriver/firefox/extension/webdriver.xpi")

        attr_reader   :name, :directory
        attr_writer   :secure_ssl, :native_events, :load_no_focus_lib
        attr_accessor :port

        class << self
          def ini
            @ini ||= ProfilesIni.new
          end

          def from_name(name)
            ini[name]
          end
        end

        #
        # Create a new Profile instance
        #
        # @example User configured profile
        #
        #   profile = Selenium::WebDriver::Firefox::Profile.new
        #   profile['network.proxy.http'] = 'localhost'
        #   profile['network.proxy.http_port'] = 9090
        #
        #   driver = Selenium::WebDriver.for :firefox, :profile => profile
        #

        def initialize(directory = nil)
          @directory = directory ? create_tmp_copy(directory) : Dir.mktmpdir("webdriver-profile")

          unless File.directory? @directory
            raise Error::WebDriverError, "Profile directory does not exist: #{@directory.inspect}"
          end

          FileReaper << @directory

          # TODO: replace constants with options hash
          @port              = DEFAULT_PORT
          @native_events     = DEFAULT_ENABLE_NATIVE_EVENTS
          @secure_ssl        = DEFAULT_SECURE_SSL
          @untrusted_issuer  = DEFAULT_ASSUME_UNTRUSTED_ISSUER
          @load_no_focus_lib = DEFAULT_LOAD_NO_FOCUS_LIB

          @additional_prefs  = {}
        end

        #
        # Set a preference for this particular profile.
        # @see http://preferential.mozdev.org/preferences.html
        #

        def []=(key, value)
          case value
          when String
            if Util.stringified?(value)
              raise ArgumentError, "preference values must be plain strings: #{key.inspect} => #{value.inspect}"
            end

            value = %{"#{value}"}
          when TrueClass, FalseClass, Integer, Float
            value = value.to_s
          else
            raise TypeError, "invalid preference: #{value.inspect}:#{value.class}"
          end

          @additional_prefs[key.to_s] = value
        end

        def absolute_path
          if Platform.win?
            directory.gsub("/", "\\")
          else
            directory
          end
        end

        def update_user_prefs
          prefs = current_user_prefs

          prefs.merge! OVERRIDABLE_PREFERENCES
          prefs.merge! @additional_prefs
          prefs.merge! DEFAULT_PREFERENCES

          prefs['webdriver_firefox_port']            = @port
          prefs['webdriver_accept_untrusted_certs']  = !secure_ssl?
          prefs['webdriver_enable_native_events']    = native_events?
          prefs['webdriver_assume_untrusted_issuer'] = assume_untrusted_certificate_issuer?

          # If the user sets the home page, we should also start up there
          prefs["startup.homepage_welcome_url"] = prefs["browser.startup.homepage"]

          write_prefs prefs
        end

        def add_webdriver_extension(force_creation = false)
          ext_path = File.join(extensions_dir, EXTENSION_NAME)

          if File.exists? ext_path
            return unless force_creation
          end

          add_extension WEBDRIVER_EXTENSION_PATH
          delete_extensions_cache
        end

        #
        # Aadd the extension (directory, .zip or .xpi) at the given path to the profile.
        #

        def add_extension(path)
          unless File.exist?(path)
            raise Error::WebDriverError, "could not find extension at #{path.inspect}"
          end

          if File.directory? path
            root = path
          else
            unless %w[.zip .xpi].include? File.extname(path)
              raise Error::WebDriverError, "expected .zip or .xpi extension, got #{path.inspect}"
            end

            root = ZipHelper.unzip(path)
          end

          ext_path = File.join extensions_dir, read_id_from_install_rdf(root)

          FileUtils.rm_rf ext_path
          FileUtils.mkdir_p File.dirname(ext_path), :mode => 0700
          FileUtils.cp_r root, ext_path
        end

        def extensions_dir
          @extensions_dir ||= File.join(directory, "extensions")
        end

        def user_prefs_path
          @user_prefs_path ||= File.join(directory, "user.js")
        end

        def delete_extensions_cache
          cache = File.join(directory, "extensions.cache")
          FileUtils.rm_f cache if File.exist?(cache)
        end

        def native_events?
          @native_events == true
        end

        def load_no_focus_lib?
          @load_no_focus_lib == true
        end

        def secure_ssl?
          @secure_ssl == true
        end

        def assume_untrusted_certificate_issuer?
          @untrusted_issuer == true
        end

        def assume_untrusted_certificate_issuer=(bool)
          @untrusted_issuer = bool
        end

        private

        def read_id_from_install_rdf(directory)
          rdf_path = File.join(directory, "install.rdf")
          doc = REXML::Document.new(File.read(rdf_path))

          REXML::XPath.first(doc, "//em:id").text
        end

        def create_tmp_copy(directory)
          tmp_directory = Dir.mktmpdir("webdriver-rb-profilecopy")

          # TODO: must be a better way..
          FileUtils.rm_rf tmp_directory
          FileUtils.mkdir_p File.dirname(tmp_directory), :mode => 0700
          FileUtils.cp_r directory, tmp_directory

          tmp_directory
        end


        def current_user_prefs
          return {} unless File.exist?(user_prefs_path)

          prefs = {}

          File.read(user_prefs_path).split("\n").each do |line|
            if line =~ /user_pref\("([^"]+)"\s*,\s*(.+?)\);/
              prefs[$1.strip] = $2.strip
            end
          end

          prefs
        end

        def write_prefs(prefs)
          File.open(user_prefs_path, "w") { |file|
            prefs.each do |key, value|
              p key => value if $DEBUG
              file.puts %{user_pref("#{key}", #{value});}
            end
          }
        end

        OVERRIDABLE_PREFERENCES = {
          "browser.startup.page"     => '0',
          "browser.startup.homepage" => '"about:blank"'
        }.freeze

        DEFAULT_PREFERENCES = {
          "app.update.auto"                           => 'false',
          "app.update.enabled"                        => 'false',
          "browser.download.manager.showWhenStarting" => 'false',
          "browser.EULA.override"                     => 'true',
          "browser.EULA.3.accepted"                   => 'true',
          "browser.link.open_external"                => '2',
          "browser.link.open_newwindow"               => '2',
          "browser.safebrowsing.enabled"              => 'false',
          "browser.search.update"                     => 'false',
          "browser.sessionstore.resume_from_crash"    => 'false',
          "browser.shell.checkDefaultBrowser"         => 'false',
          "browser.tabs.warnOnClose"                  => 'false',
          "browser.tabs.warnOnOpen"                   => 'false',
          "dom.disable_open_during_load"              => 'false',
          "extensions.update.enabled"                 => 'false',
          "extensions.update.notifyUser"              => 'false',
          "network.manage-offline-status"             => 'false',
          "security.warn_entering_secure"             => 'false',
          "security.warn_submit_insecure"             => 'false',
          "security.warn_entering_secure.show_once"   => 'false',
          "security.warn_entering_weak"               => 'false',
          "security.warn_entering_weak.show_once"     => 'false',
          "security.warn_leaving_secure"              => 'false',
          "security.warn_leaving_secure.show_once"    => 'false',
          "security.warn_submit_insecure"             => 'false',
          "security.warn_viewing_mixed"               => 'false',
          "security.warn_viewing_mixed.show_once"     => 'false',
          "signon.rememberSignons"                    => 'false',
          "javascript.options.showInConsole"          => 'true',
          "browser.dom.window.dump.enabled"           => 'true'
        }.freeze

      end # Profile
    end # Firefox
  end # WebDriver
end # Selenium
