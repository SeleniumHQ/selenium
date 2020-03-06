module CrazyFun
  module Mappings
    class RubyMappings
      class AddTestDependencies < CrazyFun::Mappings::Tasks
        def handle(_fun, dir, args)
          task = Rake::Task[task_name(dir, "#{args[:name]}-test")]

          if args.has_key?(:deps)
            add_dependencies task, dir, args[:deps]
          end
        end
      end
    end
  end
end
