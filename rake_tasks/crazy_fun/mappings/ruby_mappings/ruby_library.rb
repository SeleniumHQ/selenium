module CrazyFun
  module Mappings
    class RubyMappings
      class RubyLibrary < CrazyFun::Mappings::Tasks
        def handle(_fun, dir, args)
          desc "Build #{args[:name]} in build/#{dir}"
          task_name = task_name(dir, args[:name])

          t = task task_name do
            puts "Preparing: #{task_name} in #{build_dir}/#{dir}"
            copy_sources dir, args[:srcs]
            copy_resources dir, args[:resources], build_dir if args[:resources]
            remove_svn_dirs
          end

          add_dependencies(t, dir, args[:deps])
          add_dependencies(t, dir, args[:resources])
        end

        def copy_sources(dir, globs)
          globs.each do |glob|
            Dir[File.join(dir, glob)].each do |file|
              destination = destination_for(file)
              mkdir_p File.dirname(destination)
              cp_r file, destination
            end
          end
        end

        def remove_svn_dirs
          Dir["#{build_dir}/rb/**/.svn"].each { |file| rm_rf file }
        end

        def destination_for(file)
          File.join(build_dir, file)
        end

        def build_dir
          "build"
        end
      end
    end
  end
end
