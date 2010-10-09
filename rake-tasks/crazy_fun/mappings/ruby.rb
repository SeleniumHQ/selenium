class RubyMappings

  def add_all(fun)
    fun.add_mapping "ruby_library", RubyLibrary.new

    fun.add_mapping "ruby_test", CheckTestArgs.new
    fun.add_mapping "ruby_test", AddTestDefaults.new
    fun.add_mapping "ruby_test", JRubyTest.new
    fun.add_mapping "ruby_test", MRITest.new
    fun.add_mapping "ruby_test", AddTestDependencies.new

    fun.add_mapping "rubydocs", RubyDocs.new
    fun.add_mapping "rubygem", RubyGem.new
  end

  class RubyLibrary < Tasks

    def handle(fun, dir, args)
      desc 'Build in build/ruby'
      task_name = task_name(dir, args[:name])

      t = task task_name do
        puts "Preparing: #{task_name} in #{build_dir}/#{dir}"
        copy_sources dir, args[:srcs]
        copy_resources dir, args[:resources], build_dir if args[:resources]
        remove_svn_dirs
      end

      add_dependencies t, dir, args[:deps]
      add_dependencies t, dir, args[:resources]
    end

    def copy_sources(dir, globs)
      globs.each do |glob|
        Dir[File.join(dir, glob)].each do |file|
          destination = destination_for(file)
          mkdir_p File.dirname(destination)
          cp file, destination
        end
      end
    end

    def remove_svn_dirs
      Dir["#{build_dir}/rb/**/.svn"].each { |file| rm_rf file }
    end

    def destination_for(file)
      File.join build_dir, file
    end

    def build_dir
      "build"
    end

  end

  class CheckTestArgs
    def handle(fun, dir, args)
      raise "no :srcs specified for #{dir}" unless args.has_key? :srcs
      raise "no :name specified for #{dir}" unless args.has_key? :name
    end
  end

  class AddTestDefaults
    def handle(fun, dir, args)
      args[:include] = Array(args[:include])
      args[:include] << "#{dir}/spec"

      args[:command] = args[:command] || "spec"
      args[:require] = Array(args[:require])

      # move?
      args[:srcs] = args[:srcs].map { |str|
        Dir[File.join(dir, str)]
      }.flatten
    end
  end

  class AddTestDependencies < Tasks
    def handle(fun, dir, args)
      jruby_task = Rake::Task[task_name(dir, "#{args[:name]}-test:jruby")]
      mri_task   = Rake::Task[task_name(dir, "#{args[:name]}-test:mri")]

      # TODO:
      # Specifying a dependency here isn't ideal, but it's the easiest way to
      # avoid a lot of duplication in the build files, since this dep only applies to this task.
      # Maybe add a jruby_dep argument?
      add_dependencies jruby_task, dir, ["//common:test"]

      if args.has_key?(:deps)
        add_dependencies jruby_task, dir, args[:deps]
        add_dependencies mri_task, dir, args[:deps]
      end
    end
  end

  class JRubyTest < Tasks
    def handle(fun, dir, args)
      requires = args[:require] + %w[
        json-jruby.jar
        rubyzip.jar
        childprocess.jar
      ].map { |jar| File.join("third_party/jruby", jar) }

      desc "Run ruby tests for #{args[:name]} (jruby)"
      t = task task_name(dir, "#{args[:name]}-test:jruby") do
        puts "Running: #{args[:name]} ruby tests (jruby)"
        ENV['WD_SPEC_DRIVER'] = args[:name] # TODO: get rid of ENV

        jruby :include     => args[:include],
              :require     => requires,
              :command     => args[:command],
              :debug       => !!ENV['DEBUG'],
              :files       => args[:srcs]
      end

    end
  end

  class MRITest < Tasks
    def handle(fun, dir, args)
      desc "Run ruby tests for #{args[:name]} (mri)"
      task task_name(dir, "#{args[:name]}-test:mri") do
        puts "Running: #{args[:name]} ruby tests (mri)"
        ENV['WD_SPEC_DRIVER'] = args[:name] # TODO: get rid of ENV

        ruby :include => args[:include],
             :require => args[:require],
             :command => args[:command],
             :debug   => !!ENV['DEBUG'],
             :files   => args[:srcs]
      end
    end
  end

  class RubyDocs
    def handle(fun, dir, args)
      if have_yard?
        define_task(dir, args)
      else
        define_noop(dir)
      end
    end

    def define_task(dir, args)
      files      = args[:files] || raise("no :files specified for rubydocs")
      output_dir = args[:output_dir] || raise("no :output_dir specified for rubydocs")

      files  = Array(files).map { |glob| Dir[glob] }.flatten

      YARD::Rake::YardocTask.new("//#{dir}:docs") do |t|
        t.files = args[:files]
        t.options << "--verbose"
        t.options << "--readme" << args[:readme] if args.has_key?(:readme)
        t.options << "--output-dir" << output_dir
      end
    end

    def have_yard?
      require 'yard'
      true
    rescue LoadError
      false
    end

    def define_noop(dir)
      task "//#{dir}:docs" do
        abort "YARD is not available."
      end
    end
  end # RubyDocs

  class RubyGem
    def handle(fun, dir, args)
      raise "no :dir for rubygem" unless args[:dir]
      raise "no :version for rubygem" unless args[:version]

      if has_gem_task?
        define_gem_tasks(dir, args)
      end
    end

    def has_gem_task?
      require "rubygems"
      require "rake/gempackagetask"

      true
    rescue LoadError
      false
    end

    def define_gem_tasks(dir, args)
      deps = args[:deps] || []

      desc "Build gem #{args[:name]}-#{args[:version]}"
      task "//#{dir}:gem:build" => deps do
        require "rubygems/builder"
        gemfile = Dir.chdir(args[:dir]) {
          gemspec = spec(args)
          Gem::Builder.new(gemspec).build
        }
        mv File.join(args[:dir], gemfile), "build/#{gemfile}"
      end

      desc 'Clean rubygem artifacts'
      task "//#{dir}:gem:clean" do
        rm_rf args[:dir]
        rm_rf "build/*.gem"
      end

      desc 'Build and release the ruby gem to Gemcutter'
      task "//#{dir}:gem:release" => [:clean, :build] do
        sh "gem push build/#{args[:name]}-#{args[:version]}.gem"
      end
    end

    def spec(args)
      Gem::Specification.new do |s|
        s.name        = args[:name]
        s.version     = args[:version]
        s.summary     = "The next generation developer focused tool for automated testing of webapps"
        s.description = "WebDriver is a tool for writing automated tests of websites. It aims to mimic the behaviour of a real user, and as such interacts with the HTML of the application."
        s.authors     = ["Jari Bakken"]
        s.email       = "jari.bakken@gmail.com"
        s.homepage    = "http://selenium.googlecode.com"
        s.files       = Dir['lib/**/*', 'CHANGES', 'README']

        args[:gemdeps].each do |dep|
          s.add_dependency(*dep.shift)
        end

        if s.respond_to? :add_development_dependency
          args[:devdeps].each do |dep|
            s.add_development_dependency(*dep.shift)
          end
        end
      end
    end

  end # RubyGem
end # RubyMappings

class RubyRunner

  JRUBY_JAR = "third_party/jruby/jruby-complete-1.5.0.RC2.jar"

  def self.run(impl, opts)
    cmd = []

    case impl.to_sym
    when :jruby
      cmd << "java"
      cmd << "-Djava.awt.headless=true" if opts[:headless]
      cmd << "-jar" << JRUBY_JAR
    else
      cmd << impl.to_s
    end

    if opts[:debug]
      cmd << "-d"
    end

    if opts.has_key? :include
      cmd << "-I"
      cmd << Array(opts[:include]).join(File::PATH_SEPARATOR)
    end

    Array(opts[:require]).each do |f|
      cmd << "-r#{f}"
    end

    cmd << "-S" << opts[:command] if opts.has_key? :command
    cmd += Array(opts[:files]) if opts.has_key? :files

    puts cmd.join(' ')

    sh(*cmd)
  end
end

def jruby(opts)
  RubyRunner.run :jruby, opts
end


def ruby(opts)
  # if we're running on jruby, -Djruby.launch.inproc=false needs to be set for this to work.
  # otherwise sh("ruby", ...) will reuse the current JVM
  RubyRunner.run :ruby, opts
end
