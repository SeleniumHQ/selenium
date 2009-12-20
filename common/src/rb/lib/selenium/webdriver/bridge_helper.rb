module Selenium
  module WebDriver

    #
    # Shared across bridges
    #

    module BridgeHelper

      def wrap_script_argument(arg)
        case arg
        when Integer, Float
          { :type => "NUMBER", :value => arg }
        when TrueClass, FalseClass, NilClass
          { :type => "BOOLEAN", :value => !!arg }
        when Element
          { :type => "ELEMENT", :value => arg.ref }
        when String
          { :type => "STRING", :value => arg.to_s }
        when Array # Enumerable?
          arg.map { |e| wrap_script_argument(e) }
        else
          raise TypeError, "Parameter is not of recognized type: #{arg.inspect}:#{arg.class}"
        end
      end

      def unwrap_script_argument(arg)
        if arg.kind_of?(Array)
          arg.map { |e| unwrap_script_argument(e) }
        else
          case arg["type"]
          when "NULL"
            nil
          when "ELEMENT"
            Element.new self, element_id_from(arg["value"])
          when "POINT"
            Point.new arg['x'], arg['y']
          when "DIMENSION"
            Dimension.new arg['width'], arg['height']
          when "COOKIE"
            {:name => arg['name'], :value => arg['value']}
          else
            arg["value"]
          end
        end
      end

      def element_id_from(id)
        str = id.kind_of?(Array) ? id.first : id
        after = str.split("/").last

        after
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