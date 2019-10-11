class ExportMappings
  def add_all(fun)
    fun.add_mapping("export_file", Export::CheckPreconditions.new)
    fun.add_mapping("export_file", Export::CreateTask.new)
    fun.add_mapping("export_file", Export::AddDependencies.new)
  end
end
