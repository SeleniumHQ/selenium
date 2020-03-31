module CrazyFun
  module Mappings
    class RubyMappings
      class RubyClassCall < RubyLibrary
        def handle(_fun, dir, args)
          desc "Call class #{args[:name]} in build/#{dir}"
          task_name = task_name(dir, args[:name])

          t = task task_name do
            puts "Preparing: #{task_name} in #{build_dir}/#{dir}"
            copy_sources dir, args[:srcs]
            copy_resources dir, args[:resources], build_dir if args[:resources]
            require_source build_dir, args[:require]
            create_output_dir build_dir, args[:output_dir]
            call_class args[:klass]
            remove_sources args[:srcs]
          end

          add_dependencies(t, dir, args[:deps])
          add_dependencies(t, dir, args[:resources])
        end

        def require_source(dir, src)
          require File.join(dir, src)
        end

        def create_output_dir(root_dir, output_dir)
          mkdir_p File.join(root_dir, output_dir)
        end

        def call_class(klass)
          Object.const_get(klass).new.call
        end

        def remove_sources(globs)
          globs.each do |glob|
            Dir[File.join(build_dir, 'rb', glob)].each do |file|
              rm_rf file
            end
          end
        end
      end
    end
  end
end
