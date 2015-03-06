require 'rake-tasks/crazy_fun/mappings/common'

class ExportMappings
  def add_all(fun)
    fun.add_mapping("export_file", Export::CheckPreconditions.new)
    fun.add_mapping("export_file", Export::CreateTask.new)
    fun.add_mapping("export_file", Export::AddDependencies.new)
  end
end

module Export

  class CheckPreconditions < Tasks
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil?
    end
  end

  class ExportTasks < Tasks
    def export_name(dir, name, extension)
      name = task_name(dir, name)
      name = "build/" + (name.slice(2 ... name.length))
      name = name.sub(":", "/")
      name += extension
      Platform.path_for name
    end
  end

  class CreateTask < ExportTasks
    def handle(fun, dir, args)
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

  class AddDependencies < ExportTasks
    def handle(fun, dir, args)
      to_export = dir + "/" + args[:srcs][0]
      name = export_name(dir, args[:name], File.extname(to_export))
      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
