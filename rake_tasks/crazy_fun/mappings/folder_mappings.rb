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

module CrazyFun
  module Mappings
    class FolderMappings
      # TODO: LH - Check the usage of this. It seems it isn't consumed
      # If so all downstream fun mappings (Folder::), can be removed
      def add_all(fun)
        fun.add_mapping("folder", Folder::CheckPreconditions.new)
        fun.add_mapping("folder", Folder::CreateTask.new)
        fun.add_mapping("folder", Folder::AddDependencies.new)
      end
    end
  end
end
