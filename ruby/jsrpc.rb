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
#require 'segate'

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

  class JsObject
  
    def initialize(js_object, in_queue, out_queue, timeout, js_proxies)
      @js_object, @in_queue, @out_queue, @timeout, @js_objects = js_object, in_queue, out_queue, timeout, js_proxies
    end
    
    def to_s
      @js_object
    end
    
    # Reserved ruby methods (such as 'send') must be prefixed with '__'
    def method_missing(method, *args)
      timeout(@timeout) do
        result = nil
        Thread.new do

          # convert the arguments to javascript format
          method_name = (method.to_s =~ /__(.*)/ ? $1 : method.to_s)
          arg_string = "()"
          if(args.length > 0)
            quoted_args = args.collect { |arg| arg.is_a?(String) ? "\"#{arg}\"" : arg }
            arg_string = "(#{quoted_args.join(',')})"
          end
          object_method_args = "#{@js_object}.#{method_name}#{arg_string}"
          @out_queue.push(object_method_args)

          # wait for the result of the invocation to be posted back on our in-queue
          reply = @in_queue.pop
          if(reply =~ /__JsObject__.*__([0-9]*)/)
            # The result was a Javascript object
            id = $1.to_i
            result = @js_objects[id]
            if(!result)
              result = JsObject.new("#{reply}", @in_queue, @out_queue, @timeout, @js_objects)
              @js_objects[id] = result
            end
          elsif(reply == "__JsUndefined")
            result = nil
          elsif(reply =~ /__JsException:(.*)/)
            raise JsException.new($1)
          else
            result = reply
          end
        end.join
        result
      end
    end
  end
  
  class JsException < Exception
  end

  class Browser
    include WEBrick::HTMLUtils # escape mixin
    
    attr_accessor :proxy_server
  
    def initialize(target_host="www.google.com", port=4802, timeout=1000)
      @timeout = timeout
      @in_queue = Queue.new
      @out_queue = Queue.new
      
      @rmi_server = WEBrick::HTTPServer.new(
        :ServerType => Thread,
        :Port => port,
        :Logger => WEBrick::BasicLog.new(nil, WEBrick::BasicLog::WARN), #comment out to enable server logging
        :AccessLog => {} #comment out to enable access logging
      )

      @rmi_server.mount("/", NonCachingFileHandler, "../javascript")

      @rmi_server.mount_proc("/jsrpc-calls") do |req, res|
        res["Cache-control"] = "no-cache"
        res["Pragma"] = "no-cache"
        res["Expires"] = "-1"

        if "GET" == req.request_method
          get_reply = @out_queue.pop
          res.body = get_reply
        else # POST
          req.body do |data|
            @in_queue.push(data)
          end
        end
      end

      @rmi_server.start
      
#      @proxy_server = SeGate.new(
#        :Port          => proxy_port,
#        :ServerType    => Thread,
#        :Logger => WEBrick::BasicLog.new(nil, WEBrick::BasicLog::WARN),
#        :AccessLog => {}
#      )
#      @proxy_server.start
    end
    
    def proxy
      JsObject.new("__JsObject__TopLevel__0", @in_queue, @out_queue, @timeout, [])
    end
    
  end

end
