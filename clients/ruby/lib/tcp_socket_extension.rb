require 'timeout'
require 'socket'

class TCPSocket
  
  def self.wait_for_service(options)
    socket = nil
    Timeout::timeout(options[:timeout] || 20) do
      loop do
        begin
          socket = TCPSocket.new(options[:host], options[:port])
          return
        rescue Errno::ECONNREFUSED
          puts ".\n"
          sleep 2
        end
      end
    end
  ensure
    socket.close unless socket.nil?
  end
  
end