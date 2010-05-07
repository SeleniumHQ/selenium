require 'rake-tasks/crazy_fun/mappings/common'

class RakeMappings
  def add_all(fun)
    fun.add_mapping("rake_task", CrazyFunRake::CheckPreconditions.new)
    fun.add_mapping("rake_task", CrazyFunRake::CreateTask.new)
    fun.add_mapping("rake_task", CrazyFunRake::CreateShortTask.new)
  end
end
  
module CrazyFunRake
  class CheckPreconditions
    def handle(fun, dir, args)
      raise StandardError, "name must be set" if args[:name].nil?
      raise StandardError, "task_name must be set" if args[:task_name].nil?
      raise StandardError, "out must be set" if args[:out].nil?
    end
  end

  class CreateTask < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])
      task name => [ args[:task_name] ]
      Rake::Task[name].out = args[:out]
    end
  end
  
  class CreateShortTask < Tasks
    def handle(fun, dir, args)
      name = task_name(dir, args[:name])

      if (name.end_with? "/#{args[:name]}:#{args[:name]}")
        short_name = name.sub(/:.*$/, "")

        task short_name => name

        Rake::Task[short_name].out = args[:out]
      end
    end
  end
end