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
require 'net/http'
require 'uri'

# -----------------
# Original code by Aslak Hellesoy and Darren Hobbs
# -----------------

module Selenium

  class SeleneseInterpreter
    include Selenium
  
    def initialize(server_host, server_port, timeout)
      @server_host = server_host
      @server_port = server_port
      @timeout = timeout
    end
    
    def to_s
      "SeleneseInterpreter"
    end

    def start(browserStartCommand, browserURL)
      result = get_new_browser_session(browserStartCommand, browserURL)
      @session_id = result.to_i
      #print "@session_id = " + @session_id.to_s + "\n"
      if 0 == @session_id
        @session_id = nil
        raise SeleniumCommandError, result
      end
    end

    def do_command(commandString)
      timeout(@timeout) do
        http = Net::HTTP.new(@server_host, @server_port)
        get_string = '/selenium-server/driver/?commandRequest=' + commandString
        if @session_id != nil
          get_string = get_string + "&sessionId=" + @session_id.to_s
        end
        #print "Requesting --->" + get_string + "\n"
        response, result = http.get(get_string)
        #print "RESULT: " + result + "\n\n"
        return result
      end
    end
    
    alias old_type type
    def type(*args)
      method_missing("type", *args)
    end

    # Reserved ruby methods (such as 'send') must be prefixed with '__'
    def method_missing(method, *args)
      method_name = translate_method_to_wire_command(method)
      element_identifier = args[0]
      value = args[1]
      command_string = "|#{method_name}|#{element_identifier}|#{value}|"
      #print "command_string: " + command_string
      if method_name =~ /^get/
      	return do_command(command_string)
      end
      if method_name =~ /^(verify|assert)/
      	return do_verify(command_string)
      end
      do_action(command_string)
    end
    
    def do_verify(command_string)
      result = do_command(command_string)
      if "PASSED" != result
        raise SeleniumCommandError, result
      end
      result
    end
    
    def do_action(command_string)
      result = do_command(command_string)
      if "OK" != result
        raise SeleniumCommandError, result
      end
      result
    end
    
  end



  def translate_method_to_wire_command (method)
      method_no_prefix = (method.to_s =~ /__(.*)/ ? $1 : method.to_s)
      dropped_underscores = (method_no_prefix.gsub(/(_(.))/) {$2.upcase}) 
  end
  private :translate_method_to_wire_command
  
end

class SeleniumCommandError < RuntimeError 
end
