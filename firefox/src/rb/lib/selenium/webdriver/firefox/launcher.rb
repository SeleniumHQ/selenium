require "fcntl"

module Selenium
  module WebDriver
    module Firefox
      class Launcher

        attr_reader :binary, :connection
        SOCKET_LOCK_TIMEOUT = 45


        def initialize(binary, port = DEFAULT_PORT, profile = DEFAULT_PROFILE_NAME)
          @binary       = binary
          @port         = port.to_i

          if profile.kind_of? Profile
            @profile = profile
          else
            @profile_name = profile
            @profile      = nil
          end

          # need to be really specific about what host to use
          #
          # on os x, "localhost" will resolve to 3 different addresses (see /etc/hosts)
          # Ruby will loop over these and happily bind to the same port on each one,
          # making it completely unusable for our purposes.
          #
          @host = "127.0.0.1"
        end

        def launch
          with_lock do
            find_free_port
            create_profile
            start_silent_and_wait
            start
            connect_until_stable
          end

          self
        end

        def with_lock
          max_time = Time.now + SOCKET_LOCK_TIMEOUT
          locking_port = @port - 1

          until Time.now > max_time
            begin
              socket_lock = TCPServer.new(@host, locking_port)
              socket_lock.fcntl(Fcntl::F_SETFD, Fcntl::FD_CLOEXEC) if defined? Fcntl::FD_CLOEXEC

              yield
              return
            rescue SocketError, Errno::EADDRINUSE
              sleep 0.1
            end
          end

          raise Error::WebDriverError,
            "Unable to bind to locking port #{locking_port} within #{SOCKET_LOCK_TIMEOUT} seconds"
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
          unless @profile
            fetch_profile
            if @profile.nil?
              raise Error, WebDriverError, "could not find or create profile: #{profile.inspect}"
            end
          end

          @profile.delete_extensions_cache

          @profile.port = @port
          @profile.add_webdriver_extension(true)
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
        rescue SocketError, Errno::EADDRINUSE
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

          @profile = existing
        end

        def assert_profile
          raise "must create_profile first" if @profile.nil?
        end

      end # Launcher
    end # Firefox
  end # WebDriver
end # Selenium
