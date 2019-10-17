class RubyMappings
  class RubyDocs < Tasks
    def handle(_fun, dir, args)
      files = args[:files] || raise("no :files specified for rubydocs")
      output_dir = args[:output_dir] || raise("no :output_dir specified for rubydocs")
      readme = args[:readme] || raise("no :readme specified for rubydocs")

      files = files.map { |pattern| "build/rb/#{pattern}" }
      output_dir = "build/#{output_dir}"
      readme = "build/rb/#{readme}"

      desc 'Generate Ruby API docs'
      task "//#{dir}:docs" => args[:deps] do
        yard_args = %w[doc --verbose]
        yard_args += ["--output-dir", output_dir]
        yard_args += ["--readme", readme]

        ruby :command => "yard",
             :args    => yard_args,
             :files   => files
      end
    end
  end
end
