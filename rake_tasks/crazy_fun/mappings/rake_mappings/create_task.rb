module CrazyFun
  module Mappings
    class RakeMappings
      class CreateTask < CrazyFun::Mappings::Tasks
        def handle(fun, dir, args)
          name = task_name(dir, args[:name])
          task name => [ args[:task_name] ]
          Rake::Task[name].out = args[:out]
        end
      end
    end
  end
end
