# Copyright 2006 ThoughtWorks, Inc
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

# -----------------
# Original code by Aslak Hellesoy and Darren Hobbs
# This file has been automatically generated via XSL
# -----------------

module Selenium

  class Driver
  
    def initialize(server_host, server_port, browserStartCommand, browserURL, timeout=30000)
      @server_host = server_host
      @server_port = server_port
      @browserStartCommand = browserStartCommand
      @browserURL = browserURL
      @timeout = timeout
    end
      
    def to_s
      "Selenium Driver"
    end

    def start()
      result = get_string("getNewBrowserSession", [@browserStartCommand, @browserURL])
      @session_id = result
    end
      
    def stop()
      do_command("testComplete", [])
      @session_id = nil
    end

    def do_command(verb, args)
      timeout(@timeout) do
        http = Net::HTTP.new(@server_host, @server_port)
        command_string = '/selenium-server/driver/?cmd=' + CGI::escape(verb)
        args.length.times do |i|
            arg_num = (i+1).to_s
            command_string = command_string + "&" + arg_num + "=" + CGI::escape(args[i].to_s)
        end
        if @session_id != nil
            command_string = command_string + "&sessionId=" + @session_id.to_s
        end
        #print "Requesting --->" + command_string + "\n"
        response = http.get(command_string)
        #print "RESULT: " + response.body + "\n\n"
        if (response.body[0..1] != "OK")
            raise SeleniumCommandError, response.body
        end
        return response.body
      end
    end
      
    def get_string(verb, args)
      result = do_command(verb, args)
      return result[3..result.length]
    end
    
    def get_string_array(verb, args)
      csv = get_string(verb, args)
      token = ""
      tokens = []
      escape = false
      csv.split(//).each do |letter|
          if escape
              token = token + letter
              escape = false
              next
          end
          if (letter == '\\')
              escape = true
          elsif (letter == ',')
              tokens.push(token)
              token = ""
          else
              token = token + letter
          end
      end
      tokens.push(token)
      return tokens
    end

    def get_number(verb, args)
      # Is there something I need to do here?
      return get_string(verb, args)
    end
    
    def get_number_array(verb, args)
      # Is there something I need to do here?
      return get_string_array(verb, args)
    end

    def get_boolean(verb, args)
      boolstr = get_string(verb, args)
      if ("true" == boolstr)
          return true
      end
      if ("false" == boolstr)
          return false
      end
      raise ValueError, "result is neither 'true' nor 'false': " + boolstr
    end
    
    def get_boolean_array(verb, args)
      boolarr = get_string_array(verb, args)
      boolarr.length.times do |i|
        if ("true" == boolstr)
          boolarr[i] = true
          next
        end
        if ("false" == boolstr)
          boolarr[i] = false
          next
        end
        raise ValueError, "result is neither 'true' nor 'false': " + boolarr[i]
      end
      return boolarr
    end

  end
end
