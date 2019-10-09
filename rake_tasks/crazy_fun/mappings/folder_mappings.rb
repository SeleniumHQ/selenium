# Example:
# folder(
#  name = "mytask",
#  srcs = [
#    "file1.txt",
#    "file2.png",
#  ],
#  deps = [
#    "//some/depdendency:target",
#  ],
#  out = "outputfolder")


class FolderMappings
  def add_all(fun)
    fun.add_mapping("folder", Folder::CheckPreconditions.new)
    fun.add_mapping("folder", Folder::CreateTask.new)
    fun.add_mapping("folder", Folder::AddDependencies.new)
  end
end
