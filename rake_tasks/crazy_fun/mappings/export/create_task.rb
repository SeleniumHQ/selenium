module Export
  class CreateTask < ExportTasks
    def handle(_fun, dir, args)
      to_export = dir + "/" + args[:srcs][0]

      name = export_name(dir, args[:name], File.extname(to_export))
      file name => to_export do
        # In theory this code is broken (by me), so we could delete this if it's not being used
        # LH - Oct 2019
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
