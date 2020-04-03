module CrazyFun
  module Mappings
    class RubyMappings
      class RubyGem
        def handle(_fun, dir, args)
          raise "no :gemspec for rubygem" unless args[:gemspec]

          define_clean_task     dir, args
          define_build_task     dir, args
          define_release_task   dir, args

          define_gem_install_task dir, args
        end

        def define_build_task(dir, args)
          gemspec  = File.expand_path(args[:gemspec])
          deps     = Array(args[:deps])
          spec_dir = File.dirname(gemspec)

          desc "Build #{args[:gemspec]}"
          task "//#{dir}:gem:build" => deps do
            require 'rubygems/package'

            file = Dir.chdir(spec_dir) do
              spec = eval(File.read(gemspec))
              Gem::Package.build(spec)
            end

            mv File.join(spec_dir, file), "build/"
          end
        end

        def define_clean_task(dir, _args)
          desc 'Clean rubygem artifacts'
          task "//#{dir}:gem:clean" do
            Dir['build/*.gem'].each { |gem| rm(gem) }
          end
        end

        def define_release_task(dir, _args)
          desc 'Build and release the ruby gem to Gemcutter'
          task "//#{dir}:gem:release" => %W[//#{dir}:gem:clean //#{dir}:gem:build] do
            gem = Dir['build/*.gem'].first # safe as long as :clean does its job
            sh "gem", "push", gem
          end
        end

        def define_gem_install_task(dir, _args)
          desc 'Install gem dependencies for the current Ruby'
          task "//#{dir}:bundle" do
            bundler_path = "#{Dir.pwd}/build/third_party/rb/bundler"
            mkdir_p bundler_path

            bin_path = [bundler_path, "bin"].join(File::SEPARATOR)
            bin_path.tr!(File::SEPARATOR, File::ALT_SEPARATOR) if File::ALT_SEPARATOR # Windows
            mkdir_p bin_path

            path = ENV["PATH"].split(File::PATH_SEPARATOR)
            path = [bin_path, path].flatten.uniq.join(File::PATH_SEPARATOR)

            ENV["BUNDLE_GEMFILE"] = "rb/Gemfile"
            ENV["GEM_PATH"] = bundler_path
            ENV["PATH"] = path

            gems = `gem list`.split("\n")
            if gems.grep(/^bundler\s/).empty?
              bundler_gem = Dir["third_party/rb/bundler-*.gem"].first

              sh "gem", "install", "--local", "--no-ri", "--no-rdoc",
                 "--install-dir", ENV["GEM_PATH"],
                 "--bindir", ENV["PATH"].split(File::PATH_SEPARATOR).first,
                 bundler_gem
            end

            sh "bundle", "config", "--local", "cache_path", "../third_party/rb/vendor/cache"
            sh "bundle", "config", "--local", "path", "#{Dir.pwd}/build/third_party/rb/vendor/bundle"

            sh "bundle", "install", "--local"
          end
        end
      end
    end
  end
end
