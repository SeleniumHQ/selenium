module Selenium
  module WebDriver
    module DriverExtensions
      module HasNetworkConnection
        def network_connection_type
          connection_value = @bridge.getNetworkConnection

          # Convert connection value to type. In case the connection type is
          # not recognized return the connection value.
          case connection_value
          when 1
            :airplane_mode
          when 2
            :wifi
          when 4
            :data
          when 6
            :all
          when 0
            :none
          else
            connection_value
          end
        end

        def network_connection_type=(connection_type)
          # convert connection type to value
          connection_value = case connection_type
                             when :airplane_mode
                               1
                             when :wifi
                               2
                             when :data
                               4
                             when :all
                               6
                             when :none
                               0
                             end

          @bridge.setNetworkConnection connection_value
        end
      end
    end
  end
end
