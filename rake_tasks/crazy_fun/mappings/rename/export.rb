module Rename
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
