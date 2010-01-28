require "fcntl"

module Selenium
  module WebDriver
    module Firefox
      class Launcher

        attr_reader :binary, :connection

        def initialize(binary, port = DEFAULT_PORT, profile_name = DEFAULT_PROFILE_NAME)
          @binary       = binary
          @port         = port.to_i
          @profile_name = profile_name

          @profile      = nil
          @host         = "localhost"
        end

        def launch
          with_lock do
            find_free_port
            connect_and_kill
            create_profile
            start_silent_and_wait
            start
            connect_until_stable
          end

          self
        end

        def with_lock
          socket_lock = TCPServer.new(@host, @port - 1)
          socket_lock.fcntl(Fcntl::F_SETFD, Fcntl::FD_CLOEXEC) if defined? Fcntl::FD_CLOEXEC

          yield
        ensure
          socket_lock.close if socket_lock
        end

        def find_free_port
          port = @port

          until free_port?(port)
            port += 1
          end

          @port = port
        end

        def create_profile
          fetch_profile

          if @profile.nil?
            raise Error, WebDriverError, "could not find or create profile: #{profile.inspect}"
          end

          @profile.delete_extensions_cache

          @profile.port = @port
          @profile.add_extension(true)
          @profile.update_user_prefs
        end

        def start
          assert_profile
          @binary.start_with @profile
        end

        def start_silent_and_wait
          assert_profile
          @binary.start_with @profile, "--silent"
          @binary.wait
        end

        def connect_and_kill
          connection = ExtensionConnection.new(@host, @port)
          connection.connect(1)
          connection.quit
        rescue Errno::ECONNREFUSED, Errno::ENOTCONN, Timeout::Error => e
          # ok
        end

        def connect
          @connection = ExtensionConnection.new(@host, @port)
          @connection.connect(5)
        end

        def connect_until_stable
          max_time = Time.now + 60

          until Time.now >= max_time
            begin
              connection = ExtensionConnection.new(@host, @port)
              connection.connect(1)
              connection.close

              connect
              return
            rescue Timeout::Error => e
              puts "#{self} caught #{e.message}" if $DEBUG
              # ok
            end
          end

          raise Error::WebDriverError, "unable to obtain stable firefox connection"
        end

        def free_port?(port)
          s = TCPServer.new(@host, port)
          s.close
          true
        rescue
          false
        end

        def fetch_profile
          existing = Profile.from_name @profile_name

          unless existing
            @binary.create_base_profile @profile_name
            Profile.ini.refresh
            existing = Profile.from_name @profile_name
            raise "unable to find or create new profile" unless existing
          end

          @profile = existing.create_copy
        end

        def assert_profile
          raise "must create_profile first" if @profile.nil?
        end

      end # Launcher
    end # Firefox
  end # WebDriver
end # Selenium
