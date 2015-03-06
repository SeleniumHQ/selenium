module Selenium
  module WebDriver
    module Firefox

      #
      # @api private
      #

      class SocketLock

        def initialize(port, timeout)
          @port    = port
          @timeout = timeout
        end

        def locked(&blk)
          lock

          begin
            yield
          ensure
            release
          end
        end

        private

        def lock
          max_time = Time.now + @timeout

          until can_lock? || Time.now >= max_time
            sleep 0.1
          end

          unless did_lock?
            raise Error::WebDriverError, "unable to bind to locking port #{@port} within #{@timeout} seconds"
          end
        end

        def release
          @server && @server.close
        end

        def can_lock?
          @server = TCPServer.new(Platform.localhost, @port)
          ChildProcess.close_on_exec @server

          true
        rescue SocketError, Errno::EADDRINUSE, Errno::EBADF => ex
          $stderr.puts "#{self}: #{ex.message}" if $DEBUG
          false
        end

        def did_lock?
          !!@server
        end

      end # SocketLock
    end # Firefox
  end # WebDriver
end # Selenium
