module Selenium
  module WebDriver
    module DriverExtensions
      module HasNetworkConnection
        def network_connection_type
          connection_value = @bridge.getNetworkConnection

          connection_type = values_to_type[connection_value]

          # In case the connection type is not recognized return the
          # connection value.
          connection_type || connection_value
        end

        def network_connection_type=(connection_type)
          connection_value = type_to_values[connection_type]

          @bridge.setNetworkConnection connection_value
        end

        private

          def type_to_values
            {:airplane_mode => 1, :wifi => 2, :data => 4, :all => 6, :none => 0}
          end

          def values_to_type
            type_to_values.invert
          end
      end
    end
  end
end
