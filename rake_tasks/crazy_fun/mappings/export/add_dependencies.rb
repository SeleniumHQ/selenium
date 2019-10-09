module Export
  class AddDependencies < ExportTasks
    def handle(_fun, dir, args)
      to_export = dir + "/" + args[:srcs][0]
      name = export_name(dir, args[:name], File.extname(to_export))
      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
