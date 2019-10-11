module Export
  class ExportTasks < Tasks
    def export_name(dir, name, extension)
      name = task_name(dir, name)
      name = "build/" + (name.slice(2 ... name.length))
      name = name.sub(":", "/")
      name += extension
      Platform.path_for name
    end
  end
end
