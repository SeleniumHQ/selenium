require "socket"

module Selenium
  module WebDriver
    module SpecSupport
      
      #
      # Wrap the standalone jar
      #
      
      class RemoteServer
        
        def initialize
          @host = "127.0.0.1"
          @port = 44444 # TODO: random port
          
          raise Errno::ENOENT, path unless File.exist?(path)
          @process = ChildProcess.new("java", "-jar", path, "-port", @port.to_s)
        end
        
        def start
          @process.start
          sleep 1 until listening?
        end
        
        def stop
          if @process.started?
            @process.kill
            @process.ensure_death
          end
        end
        
        def url
          "http://#{@host}:#{@port}/wd/hub"
        end
        
        private
        
        def listening?
          $stderr.puts "waiting for #{url}"
          TCPSocket.new(@host, @port).close
          true
        rescue Errno::ECONNREFUSED
          false
        end
        
        def path
          @path ||= File.expand_path("../../../../../../build/remote/server/server-standalone.jar", __FILE__)
        end
      end
      
    end # SpecSupport
  end # WebDriver
end # Selenium