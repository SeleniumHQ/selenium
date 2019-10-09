module Python
  class AddNormalDependencies < PyTask
    def handle(fun, dir, args)
      target = Rake::Task[task_name(dir, "#{args[:name]}")]
      add_dependencies(target, dir, args[:deps])
    end
  end
end
