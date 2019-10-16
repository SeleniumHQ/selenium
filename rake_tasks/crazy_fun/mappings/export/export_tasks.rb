module Export
  class ExportTasks < Tasks
    def export_name(dir, name, extension)
      name = task_name(dir, name)
      name = "build/" + (name.slice(2 ... name.length))
      name = name.sub(":", "/")
      name += extension
      # In theory this code is broken (by me), so we could delete this if it's not being used
      # LH - Oct 2019
      Platform.path_for name
    end
  end
end
