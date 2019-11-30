module CrazyFun
  module Mappings
    class RakeMappings
      class CheckFilePreconditions
        def handle(fun, dir, args)
          raise StandardError, "name must be set" if args[:name].nil?
          raise StandardError, "src must be set" if args[:src].nil?

          # The "one output rule" means that the srcs must either be a directory
          # or a single file.
          all_files = FileList[File.join(dir, args[:src])]
          raise StandardError, "src must be a single file or directory (#{dir}, #{args.inspect})" unless all_files.length == 1
        end
      end
    end
  end
end
