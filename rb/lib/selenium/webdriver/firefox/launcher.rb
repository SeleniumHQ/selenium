require "fcntl"

module Selenium
  module WebDriver
    module Firefox

      # @private
      class Launcher

        SOCKET_LOCK_TIMEOUT       = 45
        STABLE_CONNECTION_TIMEOUT = 60

        def initialize(binary, port = nil, profile = nil)
          @binary = binary
          @port   = Integer(port || DEFAULT_PORT)

          raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1

          if profile.kind_of? Profile
            @profile = profile
          else
            @profile_name = profile
            @profile = nil
          end

          # need to be really specific about what host to use
          #
          # on os x, "localhost" will resolve to 3 different addresses (see /etc/hosts)
          # Ruby will loop over these and happily bind to the same port on each one,
          # making it completely unusable for our purposes.
          #
          @host = "127.0.0.1"
        end

        def url
          "http://#{@host}:#{@port}/hub"
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
              # make sure the fd is not inherited by the firefox process
              if defined? Fcntl::FD_CLOEXEC
                socket_lock.fcntl(Fcntl::F_SETFD, Fcntl::FD_CLOEXEC)
              end

              return yield
            rescue SocketError, Errno::EADDRINUSE
              sleep 0.1
            end
          end

          raise Error::WebDriverError, "unable to bind to locking port #{locking_port} within #{SOCKET_LOCK_TIMEOUT} seconds"
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
          fetch_profile if @profile.nil?

          @profile.add_webdriver_extension
          @profile.port = @port
          @profile_dir = @profile.layout_on_disk
        end

        def start
          assert_profile
          @binary.start_with @profile, @profile_dir
        end

        def start_silent_and_wait
          assert_profile
          @binary.start_with @profile, @profile_dir, "--silent"
          @binary.wait
        end

        def connect_until_stable
          max_time = Time.now + STABLE_CONNECTION_TIMEOUT

          until Time.now >= max_time
            return if can_connect?
            sleep 0.25
          end

          raise Error::WebDriverError, "unable to obtain stable firefox connection in #{STABLE_CONNECTION_TIMEOUT} seconds"
        end

        def can_connect?
          TCPSocket.new(@host, @port).close
          true
        rescue Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError => e
          $stderr.puts "#{e.message} for #{@host}:#{@port}" if $DEBUG
          false
        end

        def free_port?(port)
          s = TCPServer.new(@host, port)
          s.close
          true
        rescue SocketError, Errno::EADDRINUSE
          false
        end

        def fetch_profile
          if @profile_name
            @profile = Profile.from_name @profile_name
            if @profile.nil?
              raise Error::WebDriverError, "unable to find profile named: #{@profile_name.inspect}"
            end
          else
            @profile = Profile.new
          end
        end

        def assert_profile
          raise Error::WebDriverError, "must create_profile first" unless @profile && @profile_dir
        end

      end # Launcher
    end # Firefox
  end # WebDriver
end # Selenium
