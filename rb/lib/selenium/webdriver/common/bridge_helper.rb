# encoding: utf-8
#
# Licensed to the Software Freedom Conservancy (SFC) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The SFC licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

module Selenium
  module WebDriver
    #
    # Shared across bridges
    #
    # @api private
    #

    module BridgeHelper
      def unwrap_script_result(arg)
        case arg
        when Array
          arg.map { |e| unwrap_script_result(e) }
        when Hash
          element_id = element_id_from(arg)
          return Element.new(self, element_id) if element_id
          arg.each { |k, v| arg[k] = unwrap_script_result(v) }
        else
          arg
        end
      end

      def element_id_from(id)
        id['ELEMENT'] || id['element-6066-11e4-a52e-4f735466cecf']
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

        str.split(';').each do |attribute|
          if attribute.include? '='
            key, value = attribute.strip.split('=', 2)
            if result['name'].empty?
              result['name']  = key
              result['value'] = value
            elsif key == 'domain' && value.strip =~ /^\.(.+)/
              result['domain'] = Regexp.last_match(1)
            elsif key && value
              result[key] = value
            end
          elsif attribute == 'secure'
            result['secure'] = true
          end

          unless [nil, '', '0'].include?(result['expires'])
            # firefox stores expiry as number of seconds
            result['expires'] = Time.at(result['expires'].to_i)
          end
        end

        result
      end
    end # BridgeHelper
  end # WebDriver
end # Selenium
