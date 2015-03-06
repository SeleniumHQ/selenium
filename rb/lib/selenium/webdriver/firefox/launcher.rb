module Selenium
  module WebDriver
    module Firefox

      # @api private
      class Launcher

        SOCKET_LOCK_TIMEOUT       = 45
        STABLE_CONNECTION_TIMEOUT = 60

        def initialize(binary, port, profile = nil)
          @binary = binary
          @port   = Integer(port)

          raise Error::WebDriverError, "invalid port: #{@port}" if @port < 1

          if profile.kind_of? Profile
            @profile = profile
          else
            @profile_name = profile
            @profile = nil
          end

          @host = "127.0.0.1"
        end

        def url
          "http://#{@host}:#{@port}/hub"
        end

        def launch
          socket_lock.locked do
            find_free_port
            create_profile
            start_silent_and_wait
            start
            connect_until_stable
          end

          self
        end

        def quit
          @binary.quit
          FileReaper.reap(@profile_dir) if @profile_dir
        end

        def find_free_port
          @port = PortProber.above @port
        end

        def create_profile
          fetch_profile unless @profile

          @profile.add_webdriver_extension
          @profile.port = @port

          @profile_dir = @profile.layout_on_disk
          FileReaper << @profile_dir
        end

        def start
          assert_profile
          @binary.start_with @profile, @profile_dir, "-foreground"
        end

        def start_silent_and_wait
          assert_profile

          @binary.start_with @profile, @profile_dir, "-silent"
          @binary.wait
        end

        def connect_until_stable
          poller = SocketPoller.new(@host, @port, STABLE_CONNECTION_TIMEOUT)

          unless poller.connected?
            @binary.quit
            raise Error::WebDriverError, "unable to obtain stable firefox connection in #{STABLE_CONNECTION_TIMEOUT} seconds (#{@host}:#{@port})"
          end
        end

        def fetch_profile
          if @profile_name
            @profile = Profile.from_name @profile_name

            unless @profile
              raise Error::WebDriverError, "unable to find profile named: #{@profile_name.inspect}"
            end
          else
            @profile = Profile.new
          end
        end

        def assert_profile
          raise Error::WebDriverError, "must create_profile first" unless @profile && @profile_dir
        end

        def socket_lock
          @socket_lock ||= SocketLock.new(@port - 1, SOCKET_LOCK_TIMEOUT)
        end

      end # Launcher
    end # Firefox
  end # WebDriver
end # Selenium
