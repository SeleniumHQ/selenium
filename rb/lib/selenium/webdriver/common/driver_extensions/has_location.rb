module Selenium
  module WebDriver
    module DriverExtensions

      module HasLocation
        def location
          @bridge.getLocation
        end

        def location=(loc)
          unless loc.kind_of?(Location)
            raise TypeError, "expected #{Location}, got #{loc.inspect}:#{loc.class}"
          end

          @bridge.setLocation loc.latitude, loc.longitude, loc.altitude
        end

        def set_location(lat, lon, alt)
          self.location = Location.new(Float(lat), Float(lon), Float(alt))
        end
      end

    end
  end
end
