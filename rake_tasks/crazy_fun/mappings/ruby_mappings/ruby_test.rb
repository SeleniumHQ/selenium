module CrazyFun
  module Mappings
    class RubyMappings
      class RubyTest < CrazyFun::Mappings::Tasks
        def handle(_fun, dir, args)
          desc "Run ruby tests for #{args[:name]}"
          task task_name(dir, "#{args[:name]}-test") => %W[//#{dir}:bundle] do
            STDOUT.sync = true
            puts "Running: #{args[:name]} ruby tests"

            if args[:name].match /^remote-(.*)/
              puts $1
              ENV['WD_REMOTE_BROWSER'] = $1.tr('-', '_')
              puts ENV['WD_REMOTE_BROWSER']
              ENV['WD_SPEC_DRIVER'] = 'remote'
            else
              ENV['WD_SPEC_DRIVER'] = args[:name].tr('-', '_')
            end

            ruby :include => args[:include],
                 :command => args[:command],
                 :args    => %w[--format doc --color] + (!!ENV['example'] ? ['--example', ENV['example']] : []),
                 :debug   => !!ENV['log'],
                 :files   => args[:srcs]
          end
        end

        def ruby(opts)
          cmd = %w(bundle exec ruby -w)
          cmd << "-d"   if opts[:debug]

          if opts.has_key? :include
            cmd << "-I"
            cmd << Array(opts[:include]).join(File::PATH_SEPARATOR)
          end

          cmd << "-S" << opts[:command] if opts.has_key?(:command)
          cmd += Array(opts[:args]) if opts.has_key?(:args)
          cmd += Array(opts[:files]) if opts.has_key?(:files)

          puts cmd.join(' ')

          sh(*cmd)
        end
      end
    end
  end
end
