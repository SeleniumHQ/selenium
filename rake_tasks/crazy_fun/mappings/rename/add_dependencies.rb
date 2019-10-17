module Rename
  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task name => []
      task = Rake::Task[name]
      task.out = "build/#{dir}/#{args[:out]}"
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
