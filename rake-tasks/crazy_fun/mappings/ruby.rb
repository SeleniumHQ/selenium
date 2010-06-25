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
      t = task(task_name(dir, "ruby:lib")) do
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
      Dir["#{build_dir}/**/.svn"].each { |file| rm_rf file }
    end

    def build_dir
      "build/ruby"
    end

    def destination_for(file)
      File.join build_dir, file.sub(%r[.*/rb/], '')
    end
  end

  class CheckTestArgs
    def handle(fun, dir, args)
      raise "no :srcs specified for #{dir}" unless args.has_key? :srcs
      raise "no :driver_name specified for #{dir}" unless args.has_key? :driver_name
    end
  end

  class AddTestDefaults
    def handle(fun, dir, args)
      args[:include] = [".", "common/src/rb/lib", "common/test/rb/lib"] + Array(args[:include])
      args[:command] = args[:command] || "spec"
      args[:require] = Array(args[:require])

      # move?
      args[:srcs] = args[:srcs].map { |str| Dir[str] }.flatten
    end
  end

  class AddTestDependencies < Tasks
    def handle(fun, dir, args)
      jruby_task = Rake::Task[task_name(dir, "ruby:test:jruby")]
      mri_task   = Rake::Task[task_name(dir, "ruby:test:mri")]

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
      req = ["third_party/jruby/json-jruby.jar"] + args[:require]

      desc "Run ruby tests for #{dir} (jruby)"
      t = task task_name(dir, "ruby:test:jruby") do
        puts "Running: #{args[:driver_name]} ruby tests (jruby)"
        ENV['WD_SPEC_DRIVER'] = args[:driver_name] # TODO: get rid of ENV

        jruby :include     => args[:include],
              :require     => req,
              :command     => args[:command],
              :files       => args[:srcs],
              :objectspace => dir.include?("jobbie") # hack
      end

    end
  end

  class MRITest < Tasks
    def handle(fun, dir, args)
      desc "Run ruby tests for #{dir} (mri)"
      task task_name(dir, "ruby:test:mri") do
        puts "Running: #{args[:driver_name]} ruby tests (mri)"
        ENV['WD_SPEC_DRIVER'] = args[:driver_name] # TODO: get rid of ENV

        ruby :include => args[:include],
             :require => args[:require],
             :command => args[:command],
             :files   => args[:srcs]
      end
    end
  end

  class RubyDocs
    def handle(fun, dir, args)
      if have_yard?
        define_task(args)
      else
        define_noop
      end
    end

    def define_task(args)
      files      = args[:files] || raise("no :files specified for rubydocs")
      output_dir = args[:output_dir] || raise("no :output_dir specified for rubydocs")

      files  = Array(files).map { |glob| Dir[glob] }.flatten

      YARD::Rake::YardocTask.new("ruby:docs") do |t|
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

    def define_noop
      task :rubydocs do
        abort "YARD is not available."
      end
    end
  end # RubyDocs

  class RubyGem
    def handle(fun, dir, args)
      raise "no :dir for rubygem" unless args[:dir]
      raise "no :version for rubygem" unless args[:version]

      if has_gem_task?
        define_gem_tasks(args)
      else
        define_noop
      end
    end

    def has_gem_task?
      require "rubygems"
      require "rake/gempackagetask"

      true
    rescue LoadError
      false
    end

    def define_gem_tasks(args)
      namespace(:ruby) {
        namespace(:gem) {
          deps = args[:deps] || []

          task :build => deps do
            require "rubygems/builder"
            gemfile = Dir.chdir(args[:dir]) { Gem::Builder.new(spec(args)).build }
            mv File.join(args[:dir], gemfile), "build/#{gemfile}"
          end

          task :clean do
            rm_rf args[:dir]
            rm_rf "build/*.gem"
          end

          desc 'Build and release the ruby gem to Gemcutter'
          task :release => [:clean, :build] do
            sh "gem push build/#{args[:name]}-#{args[:version]}.gem"
          end
        }
      }
    end

    def spec(args)
      Gem::Specification.new do |s|
        s.name          = args[:name]
        s.version       = args[:version]
        s.summary       = "The next generation developer focused tool for automated testing of webapps"
        s.description   = "WebDriver is a tool for writing automated tests of websites. It aims to mimic the behaviour of a real user, and as such interacts with the HTML of the application."
        s.authors       = ["Jari Bakken"]
        s.email         = "jari.bakken@gmail.com"
        s.homepage      = "http://selenium.googlecode.com"

        s.add_dependency "json_pure"
        s.add_dependency "rubyzip"
        s.add_dependency "ffi", ">= 0.6.1"

        if s.respond_to? :add_development_dependency
          s.add_development_dependency "rspec"
          s.add_development_dependency "rack"
        end

        s.files = Dir['lib/**/*', 'CHANGES', 'README']
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
      cmd << "-X+O" if opts[:objectspace]
    else
      cmd << impl.to_s
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
