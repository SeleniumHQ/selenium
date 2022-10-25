module CrazyFun
  module Mappings
    class RakeMappings
      class CheckPreconditions
        def handle(fun, dir, args)
          raise StandardError, "name must be set" if args[:name].nil?
          raise StandardError, "task_name must be set" if args[:task_name].nil?
          raise StandardError, "out must be set" if args[:out].nil?
        end
      end
    end
  end
end
