# Utility methods for generating tasks

module Rake
  class Task
    attr_accessor :deps
    attr_accessor :out
  end
end

class BaseGenerator
  def create_deps_(out, args)
    # We depend on our sources
    file out => FileList[args[:srcs]] unless args[:srcs].nil?

    add_deps_(out, args[:srcs])
    add_deps_(out, args[:deps])
    add_deps_(out, args[:resources])

    task args[:name].to_sym => out unless args[:name] == out

    t = Rake::Task[args[:name].to_sym]
    t.deps = args[:deps]
    t.out = out
  end
  
  def add_deps_(task_name, srcs)
    if srcs.nil?
      return
    end

    srcs.each do |src|
      # Is the src a file or a symbol? If it's a symbol, we're good to go
      if src.is_a? Symbol
        file task_name.to_sym => [src]
      elsif src.is_a? Hash
        add_deps_(task_name, src.keys)
      else
        # Fine. Assume we're dealing with a string, and create a FileList
        file task_name.to_sym => FileList[src]
      end
    end
  end
end

# TODO(simon): Delete this. It's not working out dependencies correctly
$targets = {}
def build_deps_(srcs)
  deps = []

  return deps unless srcs

  Array(srcs).each do |src|
    if ($targets[src]) then
     deps += $targets[src][:deps]
    else
     deps += FileList[src]
    end
  end
  deps
end

