module Selenium
  module WebDriver

    #
    # Shared across bridges
    #
    # @private
    #

    module BridgeHelper

      def unwrap_script_result(arg)
        if arg.kind_of?(Array)
          arg.map { |e| unwrap_script_result(e) }
        else
          if arg.kind_of?(Hash) && arg.member?("ELEMENT")
            Element.new self, element_id_from(arg)
          else
            arg
          end
        end
      end

      def element_id_from(id)
        id['ELEMENT']
      end

      def parse_cookie_string(str)
        result = {
          'name'    => '',
          'value'   => '',
          'domain'  => '',
          'path'    => '',
          'expires' => '',
          'secure'  => false
        }

        str.split(";").each do |attribute|
          if attribute.include? "="
            key, value = attribute.strip.split("=", 2)
            if result['name'].empty?
              result['name']  = key
              result['value'] = value
            elsif key == 'domain' && value.strip =~ /^\.(.+)/
              result['domain'] = $1
            elsif key && value
              result[key] = value
            end
          elsif attribute == "secure"
            result['secure'] = true
          end

          unless [nil, "", "0"].include?(result['expires'])
            # firefox stores expiry as number of seconds
            result['expires'] = Time.at(result['expires'].to_i)
          end
        end

        result
      end

    end # BridgeHelper
  end # WebDriver
end # Selenium