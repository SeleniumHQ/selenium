require 'rake-tasks/crazy_fun/mappings/common'

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

module Folder

  class CheckPreconditions < Tasks
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs must be set" if args[:srcs].nil?
    end
  end

  class CreateTask < Tasks
    def handle(fun, dir, args)
      def dest_name(dir, args, filename)
	"build/#{dir}/#{args[:out] || args[:name]}/#{File.basename(filename)}"
      end

      task task_name(dir, args[:name]) do
	(args[:srcs] || []).each do |src|
          to_export = "#{dir}/#{src}"
          src = Platform.path_for to_export
          dest = dest_name(dir, args, src)
          mkdir_p File.dirname(dest)
	  cp_r src, dest
        end

	(args[:deps] || []).each do |dep|
	  file = Rake::Task[dep].out
	  cp_r file, dest_name(dir, args, file)
	end
      end
    end
  end

  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
