class RubyMappings
  class RubyTest < Tasks
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
  end
end
