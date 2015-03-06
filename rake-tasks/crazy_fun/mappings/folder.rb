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
      raise StandardError, ":srcs or :deps must be set" if args[:srcs].nil? and args[:deps].nil?
    end
  end

  class CreateTask < Tasks
    def dest_dir(dir, args)
      path_for "build/#{dir}/#{args[:out] || args[:name]}"
    end

    def handle(fun, dir, args)
      folder = dest_dir(dir, args)

      name = task_name(dir, args[:name])
      task name do
        puts "Preparing: #{name} as #{folder}"
        mkdir_p folder
        copy_resources(dir, args[:srcs], folder) unless args[:srcs].nil?
        copy_resources(dir, args[:deps], folder) unless args[:deps].nil?
      end

      Rake::Task[name].out = folder
    end
  end

  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task = Rake::Task[name]
      add_dependencies(task, dir, args[:deps]) unless args[:deps].nil?
      add_dependencies(task, dir, args[:srcs])
    end
  end
end
