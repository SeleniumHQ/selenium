module Selenium
  module WebDriver
    module Firefox
      class Profile
        include ProfileHelper

        WEBDRIVER_EXTENSION_PATH = File.expand_path("#{WebDriver.root}/selenium/webdriver/firefox/extension/webdriver.xpi")
        WEBDRIVER_PREFS          = {
          :native_events    => 'webdriver_enable_native_events',
          :untrusted_certs  => 'webdriver_accept_untrusted_certs',
          :untrusted_issuer => 'webdriver_assume_untrusted_issuer',
          :port             => 'webdriver_firefox_port',
          :log_file         => 'webdriver.log.file'
        }

        attr_reader   :name, :log_file
        attr_writer   :secure_ssl, :native_events, :load_no_focus_lib

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

        def initialize(model = nil)
          @model = verify_model(model)

          model_prefs = read_model_prefs

          if model_prefs.empty?
            @native_events     = DEFAULT_ENABLE_NATIVE_EVENTS
            @secure_ssl        = DEFAULT_SECURE_SSL
            @untrusted_issuer  = DEFAULT_ASSUME_UNTRUSTED_ISSUER
            @load_no_focus_lib = DEFAULT_LOAD_NO_FOCUS_LIB

            @additional_prefs  = {}
          else
            # TODO: clean this up
            @native_events     = model_prefs.delete(WEBDRIVER_PREFS[:native_events]) == "true"
            @secure_ssl        = model_prefs.delete(WEBDRIVER_PREFS[:untrusted_certs]) != "true"
            @untrusted_issuer  = model_prefs.delete(WEBDRIVER_PREFS[:untrusted_issuer]) == "true"
            @load_no_focus_lib = model_prefs.delete(WEBDRIVER_PREFS[:load_no_focus_lib]) == "true" # not stored in profile atm, so will always be false.
            @additional_prefs  = model_prefs
          end

          @extensions        = {}
        end

        def layout_on_disk
          profile_dir = @model ? create_tmp_copy(@model) : Dir.mktmpdir("webdriver-profile")
          FileReaper << profile_dir

          install_extensions(profile_dir)
          delete_lock_files(profile_dir)
          delete_extensions_cache(profile_dir)
          update_user_prefs_in(profile_dir)

          profile_dir
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

            value = value.to_json
          when TrueClass, FalseClass, Integer, Float
            value = value.to_s
          else
            raise TypeError, "invalid preference: #{value.inspect}:#{value.class}"
          end

          @additional_prefs[key.to_s] = value
        end

        def port=(port)
          self[WEBDRIVER_PREFS[:port]] = port
        end

        def log_file=(file)
          @log_file = file
          self[WEBDRIVER_PREFS[:log_file]] = file
        end

        def add_webdriver_extension
          unless @extensions.has_key?(:webdriver)
            add_extension(WEBDRIVER_EXTENSION_PATH, :webdriver)
          end
        end

        #
        # Add the extension (directory, .zip or .xpi) at the given path to the profile.
        #

        def add_extension(path, name = extension_name_for(path))
          @extensions[name] = Extension.new(path)
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

        def proxy=(proxy)
          unless proxy.kind_of? Proxy
            raise TypeError, "expected #{Proxy.name}, got #{proxy.inspect}:#{proxy.class}"
          end

          case proxy.type
          when :manual
            self['network.proxy.type'] = 1

            set_manual_proxy_preference "ftp", proxy.ftp
            set_manual_proxy_preference "http", proxy.http
            set_manual_proxy_preference "ssl", proxy.ssl

            if proxy.no_proxy
              self["network.proxy.no_proxies_on"] = proxy.no_proxy
            else
              self["network.proxy.no_proxies_on"] = ""
            end
          when :pac
            self['network.proxy.type'] = 2
            self['network.proxy.autoconfig_url'] = proxy.pac
          when :auto_detect
            self['network.proxy.type'] = 4
          else
            raise ArgumentError, "unsupported proxy type #{proxy.type}"
          end

          proxy
        end

        private

        def set_manual_proxy_preference(key, value)
          return unless value

          host, port = value.to_s.split(":", 2)

          self["network.proxy.#{key}"] = host
          self["network.proxy.#{key}_port"] = Integer(port) if port
        end

        def install_extensions(directory)
          destination = File.join(directory, "extensions")

          @extensions.each do |name, extension|
            p :extension => name if $DEBUG
            extension.write_to(destination)
          end
        end

        def read_model_prefs
          return {} unless @model

          read_user_prefs(File.join(@model, 'user.js'))
        end

        def delete_extensions_cache(directory)
          FileUtils.rm_f File.join(directory, "extensions.cache")
        end

        def delete_lock_files(directory)
          %w[.parentlock parent.lock].each do |name|
            FileUtils.rm_f File.join(directory, name)
          end
        end

        def extension_name_for(path)
          File.basename(path, File.extname(path))
        end

        def update_user_prefs_in(directory)
          path = File.join(directory, 'user.js')
          prefs = read_user_prefs(path)

          prefs.merge! DEFAULT_PREFERENCES
          prefs.merge! @additional_prefs
          prefs.merge! FROZEN_PREFERENCES

          prefs[WEBDRIVER_PREFS[:untrusted_certs]]  = !secure_ssl?
          prefs[WEBDRIVER_PREFS[:native_events]]    = native_events?
          prefs[WEBDRIVER_PREFS[:untrusted_issuer]] = assume_untrusted_certificate_issuer?

          # If the user sets the home page, we should also start up there
          prefs["startup.homepage_welcome_url"] = prefs["browser.startup.homepage"]

          write_prefs prefs, path
        end

        def read_user_prefs(path)
          return {} unless File.exist?(path)

          prefs = {}

          File.read(path).split("\n").each do |line|
            if line =~ /user_pref\("([^"]+)"\s*,\s*(.+?)\);/
              prefs[$1.strip] = $2.strip
            end
          end

          prefs
        end

        def write_prefs(prefs, path)
          File.open(path, "w") { |file|
            prefs.each do |key, value|
              p key => value if $DEBUG
              file.puts %{user_pref("#{key}", #{value});}
            end
          }
        end

        DEFAULT_PREFERENCES = {
          "browser.startup.page"     => '0',
          "browser.startup.homepage" => '"about:blank"',
          "dom.max_script_run_time"  => '30',
        }.freeze


        # Profile preferences that are essential to the Firefox driver operating
        # correctly. Users are not permitted to override these values.

        FROZEN_PREFERENCES = {
          "app.update.auto"                           => 'false',
          "app.update.enabled"                        => 'false',
          "browser.download.manager.showWhenStarting" => 'false',
          "browser.EULA.override"                     => 'true',
          "browser.EULA.3.accepted"                   => 'true',
          "browser.link.open_external"                => '2',
          "browser.link.open_newwindow"               => '2',
          "browser.safebrowsing.enabled"              => 'false',
          "browser.safebrowsing.malware.enabled"      => 'false',
          "browser.search.update"                     => 'false',
          "browser.sessionstore.resume_from_crash"    => 'false',
          "browser.shell.checkDefaultBrowser"         => 'false',
          "browser.tabs.warnOnClose"                  => 'false',
          "browser.tabs.warnOnOpen"                   => 'false',
          "devtools.errorconsole.enabled"             => 'true',
          "dom.disable_open_during_load"              => 'false',
          "extensions.logging.enabled"                => 'true',
          "extensions.update.enabled"                 => 'false',
          "extensions.update.notifyUser"              => 'false',
          "network.manage-offline-status"             => 'false',
          "network.http.phishy-userpass-length"       => '255',
          "network.http.max-connections-per-server"   => '10',
          "prompts.tab_modal.enabled"                 => "false",
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
          "toolkit.networkmanager.disable"            => 'true',
          "toolkit.telemetry.prompted"                => 'true',
          "javascript.options.showInConsole"          => 'true',
          "browser.dom.window.dump.enabled"           => 'true',
          "dom.report_all_js_exceptions"              => "true"
        }.freeze

      end # Profile
    end # Firefox
  end # WebDriver
end # Selenium
