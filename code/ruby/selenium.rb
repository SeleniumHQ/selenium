# Copyright 2004 ThoughtWorks, Inc
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.
#
require 'thread'
require 'webrick'
require 'webrick/httpproxy'

# -----------------
# Original code by Aslak Hellesoy and Darren Hobbs
# -----------------

module Selenium

  # Patch webrick so it tells browser not to cache

  class NonCachingFileHandler < WEBrick::HTTPServlet::FileHandler
    def service(req, res)
      res["Cache-control"] = "no-cache"
      res["Pragma"] = "no-cache"
      res["Expires"] = "-1"
      super
    end
  end

  class SeleneseInterpreter
  
    def initialize(in_queue, out_queue, timeout)
      @in_queue, @out_queue, @timeout = in_queue, out_queue, timeout
    end
    
    def to_s
      "SeleneseInterpreter"
    end

    def doCommand(commandString)
      timeout(@timeout) do
        result = nil
        Thread.new do
          #puts "about to push #{commandString} onto the out queue"
          @out_queue.push(commandString)
          if "|testComplete|||" != commandString
            #puts "Waiting for next reply/request"
            result = @in_queue.pop
          end
        end.join
        if nil != result
          if "OK" != result
            if "PASSED" != result
              raise SeleniumCommandError, result
            end
          end
        end
        result
      end
    end
    
    # Reserved ruby methods (such as 'send') must be prefixed with '__'
    def method_missing(method, *args)
      method_name = (method.to_s =~ /__(.*)/ ? $1 : method.to_s)
      element_identifier = args[0]
      value = args[1]
      command_string = "|#{method_name}|#{element_identifier}|#{value}|"
      #puts command_string
      doCommand(command_string)
    end
  end
  
  class WebrickCommandProcessor
    include WEBrick::HTMLUtils # escape mixin
    
    attr_accessor :proxy_server
  
    def initialize(port=7896, timeout=1000)
      @timeout = timeout
      @in_queue = Queue.new
      @out_queue = Queue.new
      
      @rmi_server = WEBrick::HTTPServer.new(
        :ServerType => Thread,
        :Port => port,
        :Logger => WEBrick::BasicLog.new(nil, WEBrick::BasicLog::WARN), #comment out to enable server logging
        :AccessLog => {} #comment out to enable access logging
      )

      # AUT
      @rmi_server.mount("/", NonCachingFileHandler, "../javascript/tests/html")

      # Selenium's static files and dynamic handler
      @rmi_server.mount("/selenium-driver", NonCachingFileHandler, "../javascript")
      @rmi_server.mount_proc("/selenium-driver/driver") do |req, res|
        res["Cache-control"] = "no-cache"
        res["Pragma"] = "no-cache"
        res["Expires"] = "-1"

        # Only handle "GET" for now
        if "GET" == req.request_method
          command_result = req.query['commandResult']
          selenium_start = req.query['seleniumStart']
          # puts "--> #{command_result} , #{selenium_start}" 
          @in_queue.push(command_result) unless selenium_start
          get_reply = @out_queue.pop
          res.body = get_reply
        end
      end

      @rmi_server.start
    end
    
    def proxy
      SeleneseInterpreter.new(@in_queue, @out_queue, @timeout)
    end
  end

  # Will create and then close an instance of IE
  class WindowsIEBrowserLauncher
    def initialize()
      require 'win32ole'
      @ie = nil
    end
    def launch(url)
      @ie = WIN32OLE.new('InternetExplorer.Application') if @ie == nil
      show
      @ie.navigate(url)
    end
    def close()
      sleep 0.2 # a hack, we should be waiting for the testcomplete command to be processed
      @ie.quit if @ie
      @ie = nil
    end
    def show
      @ie.visible = true
    end
    def hide
      @ie.visible = false
    end
  end  

  module SpecifiedPathBrowserLauncher
    @@executable = nil
    def initialize(executable = @@executable)
      @executable = executable || raise("No executable specified")
    end
  end
    
  class UnixSpecifiedPathBrowserLauncher
    include SpecifiedPathBrowserLauncher
    def launch(url)
      @pid = Process.fork{exec "#{@executable} #{url}"}
    end
    def close
      Process.kill('SIGKILL', @pid)
    end
  end

  class WindowsSpecifiedPathBrowserLauncher
    include SpecifiedPathBrowserLauncher
    def launch(url)
      @thread = Thread.new{system("#{@executable} #{url}")}
    end
    def close; end
  end
    
  class WindowsSpecifiedPathBrowserLauncher2
    include SpecifiedPathBrowserLauncher
    def launch(url)
      system("start #{@executable} #{url}")\
    end
    def close; end
  end

  # Will use existing browser if available; won't close it regardless
  class WindowsDefaultBrowserLauncher
      def launch(url)
        system('cmd /c start ' + url)
      end
      def close; end
  end

end

class SeleniumCommandError < RuntimeError 
end
