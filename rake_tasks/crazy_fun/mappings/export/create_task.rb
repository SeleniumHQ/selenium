module Export
  class CreateTask < ExportTasks
    def handle(_fun, dir, args)
      to_export = dir + "/" + args[:srcs][0]

      name = export_name(dir, args[:name], File.extname(to_export))
      file name => to_export do
        src = Platform.path_for "#{dir}/#{args[:srcs][0]}"
        mkdir_p File.dirname(name)
        cp_r src, name
      end

      task_name = task_name(dir, args[:name])
      task task_name => name
      task "#{task_name}#{File.extname(to_export)}" => task_name
      Rake::Task[task_name].out = name
    end
  end
end
