module Folder
  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps]) unless args[:deps].nil?
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
