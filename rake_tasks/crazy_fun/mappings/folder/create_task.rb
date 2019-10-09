module Folder
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
end
