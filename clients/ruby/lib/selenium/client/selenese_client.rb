module Selenium
  module Client

    module SeleneseClient
  
      def do_command(verb, args)
        timeout(@timeout) do
          http = Net::HTTP.new(@server_host, @server_port)
          data = 'cmd=' + CGI::escape(verb)
          args.length.times do |i|
              arg_num = (i+1).to_s
              data += '&' + arg_num + '=' + CGI::escape(args[i].to_s)
          end
          if @session_id != nil
              data += '&sessionId=' + @session_id.to_s
          end
          #print "Requesting --->" + command_string + "\n"
          headers = { 'Content-Type' => 'application/x-www-form-urlencoded; charset=utf-8' }
          response = http.post('/selenium-server/driver/', data, headers)
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
end
