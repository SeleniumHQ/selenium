module CrazyFun
  module Mappings
    class RubyMappings
      class RubyDocs < CrazyFun::Mappings::Tasks
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
