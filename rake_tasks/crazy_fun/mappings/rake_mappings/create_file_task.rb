module CrazyFun
  module Mappings
    class RakeMappings
      class CreateFileTask < CrazyFun::Mappings::Tasks
        def handle(fun, dir, args)
          name = task_name(dir, args[:name])

          src = File.join(dir, args[:src])
          if File.directory? src
            file name => FileList[File.join(src, "**")]
          else
            file name => src
          end
#      out = args[:out].nil? ? args[:name] : args[:out]

          Rake::Task[name].out = src
        end
      end
    end
  end
end
