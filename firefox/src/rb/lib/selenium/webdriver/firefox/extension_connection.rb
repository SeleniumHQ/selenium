module Selenium
  module WebDriver
    module Firefox
      class ExtensionConnection

        def initialize(host, port)
          @host = host
          @port = port
        end

        def url
          "http://#{@host}:#{@port}/hub"
        end

        def connect(timeout = 20)
          Timeout.timeout(timeout) {
            loop do
              begin
                return TCPSocket.new(@host, @port).close
              rescue Errno::ECONNREFUSED, Errno::ENOTCONN, SocketError => e
                $stderr.puts "#{self} caught #{e.message} for #{@host}:#{@port}" if $DEBUG
                sleep 0.25
              end
            end
          }
        end

      end # ExtensionConnection
    end # Firefox
  end # WebDriver
end # Selenium
