class RubyMappings
  class RubyLinter < Tasks
    def handle(_fun, dir, args)
      desc 'Run RuboCop'
      task task_name(dir, args[:name]) => args[:deps] do
        ruby :command => 'rubocop',
             :files   => args[:srcs]
      end
    end
  end
end
