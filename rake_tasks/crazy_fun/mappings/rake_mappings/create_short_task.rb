module CrazyFun
  module Mappings
    class RakeMappings
      class CreateShortTask < CrazyFun::Mappings::Tasks
        def handle(fun, dir, args)
          name = task_name(dir, args[:name])

          if name.end_with?("/#{args[:name]}:#{args[:name]}")
            short_name = name.sub(/:.*$/, "")

            task short_name => name

            Rake::Task[short_name].out = Rake::Task[name].out
          end
        end
      end
    end
  end
end
