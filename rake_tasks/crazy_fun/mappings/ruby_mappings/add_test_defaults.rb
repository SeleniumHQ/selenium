module CrazyFun
  module Mappings
    class RubyMappings
      class AddTestDefaults
        def handle(_fun, dir, args)
          args[:include] = Array(args[:include])
          args[:include] << "#{dir}/spec"

          args[:command] = args[:command] || "rspec"
        end
      end
    end
  end
end
