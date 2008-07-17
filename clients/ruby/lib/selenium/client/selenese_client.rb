module Selenium
  module Client

    HTTP_HEADERS = { 'Content-Type' => 'application/x-www-form-urlencoded; charset=utf-8' }
    
    module SeleneseClient
      attr_reader :session_id
  
      def do_command(verb, args)
        timeout(@timeout) do
          status, response = http_post(http_request_for(verb, args))
          raise SeleniumCommandError, response unless status == "OK"          
          response
        end
      end
      
      def get_string(verb, args)
        do_command(verb, args)
      end
    
      def get_string_array(verb, args)
        csv = get_string(verb, args)
        token = ""
        tokens = []
        escape = false
        csv.split(//).each do |letter|
          if escape
            token += letter
            escape = false
            next
          end
          case letter
            when '\\'
              escape = true
            when ','
              tokens << token
              token = ""
            else
              token += letter
          end
        end
        tokens << token
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
        parse_boolean_value get_string(verb, args)
      end
    
      def get_boolean_array(verb, args)
        get_string_array(verb, args).collect {|value| parse_boolean_value(value)}
      end
      
      protected

      def parse_boolean_value(value)
        if ("true" == value)
            return true
        elsif ("false" == value)
            return false
        end
        raise ProtocolError, "Invalid Selenese boolean value that is neither 'true' nor 'false': got '#{value}'"
      end

      def http_request_for(verb, args)
        data = "cmd=#{CGI::escape(verb)}"
        args.each_with_index do |arg, index|
          data << "&#{index.succ}=#{CGI::escape(arg.to_s)}"
        end
        data << "&sessionId=#{session_id}" unless session_id.nil?
        data
      end
            
      def http_post(data)
        #print "Requesting --->" + command_string + "\n"
        http = Net::HTTP.new(@server_host, @server_port)
        response = http.post('/selenium-server/driver/', data, HTTP_HEADERS)
        #print "RESULT: " + response.body + "\n\n"å          
        [ response.body[0..1], response.body[3..-1] ]
      end
      
    end

  end
end
