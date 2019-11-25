module CrazyFun
  module Mappings
    class RubyMappings
      class RubyLinter < CrazyFun::Mappings::Tasks
        def handle(_fun, dir, args)
          desc 'Run RuboCop'
          task task_name(dir, args[:name]) => args[:deps] do
            ruby :command => 'rubocop',
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
