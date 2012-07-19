require 'rake-tasks/crazy_fun/mappings/common'

class RenameMappings
  def add_all(fun)
    fun.add_mapping("rename", Rename::CheckPreconditions.new)
    fun.add_mapping("rename", Rename::AddDependencies.new)
    fun.add_mapping("rename", Rename::Export.new)
  end
end

module Rename

  class CheckPreconditions < Tasks
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs or :deps must be set" if args[:srcs].nil? and args[:deps].nil?
      raise StandardError, ":out must be set" if args[:out].nil?
    end
  end

  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task name => []
      task = Rake::Task[name]
      task.out = "build/#{dir}/#{args[:out]}"
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end

  class Export < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task = Rake::Task[name]

      task name do
        from = Rake::Task[args[:srcs].nil? ? args[:deps][0] : args[:srcs][0]].out
        to = Rake::Task[task].out
        mkdir_p File.dirname(to)
        cp_r from, to
      end
    end
  end
end

require 'rake-tasks/crazy_fun/mappings/common'

class RenameMappings
  def add_all(fun)
    fun.add_mapping("rename", Rename::CheckPreconditions.new)
    fun.add_mapping("rename", Rename::AddDependencies.new)
    fun.add_mapping("rename", Rename::Export.new)
  end
end

module Rename

  class CheckPreconditions < Tasks
    def handle(fun, dir, args)
      raise StandardError, ":name must be set" if args[:name].nil?
      raise StandardError, ":srcs or :deps must be set" if args[:srcs].nil? and args[:deps].nil?
      raise StandardError, ":out must be set" if args[:out].nil?
    end
  end

  class AddDependencies < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task name => []
      task = Rake::Task[name]
      task.out = "build/#{dir}/#{args[:out]}"
      add_dependencies(task, dir, args[:deps])
      add_dependencies(task, dir, args[:srcs])
    end
  end

  class Export < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task = Rake::Task[name]

      task name do
        from = Rake::Task[args[:srcs].nil? ? args[:deps][0] : args[:srcs][0]]
        from_out = from.out
        while from_out == nil and from.prerequisites.size == 1 do
          from = Rake::Task[from.prerequisites[0]]
          from_out = from.out
        end

        to = Rake::Task[task].out
        mkdir_p File.dirname(to)
        cp_r from_out, to
      end
    end
  end
end

