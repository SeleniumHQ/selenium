module CrazyFun
  module Mappings
    class RubyMappings
      class ExpandSourceFiles
        def handle(_fun, dir, args)
          args[:srcs] = args[:srcs].map { |str| Dir[File.join(dir, str)] }.flatten
        end
      end
    end
  end
end
