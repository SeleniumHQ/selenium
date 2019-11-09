module CrazyFun
  module Mappings
    class RubyMappings
      class CheckTestArgs
        def handle(_fun, dir, args)
          raise "no :srcs specified for #{dir}" unless args.has_key? :srcs
          raise "no :name specified for #{dir}" unless args.has_key? :name
        end
      end
    end
  end
end
