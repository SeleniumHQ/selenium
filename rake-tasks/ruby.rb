class RubyMappings

  def add_all(fun)
    fun.add_mapping "ruby_test", CheckArgs.new
    fun.add_mapping "ruby_test", AddDefaults.new
    fun.add_mapping "ruby_test", JRubyTest.new   # this probably needs //common:test as a dependency
    fun.add_mapping "ruby_test", MRITest.new

    # TODO: fun.add_mapping("rubygem", RubyGem.new)
    # TODO: fun.add_mapping("rubydocs", RubyDocs.new)
  end

  class RubyTasks < Tasks
    def task_name(dir, name)
      super dir, "ruby:#{name}"
    end
  end

  class CheckArgs
    def handle(fun, dir, args)
      raise "no :srcs specified for #{dir}" unless args.has_key? :srcs
      raise "no :driver_name specified for #{dir}" unless args.has_key? :driver_name
    end
  end

  class AddDefaults
    def handle(fun, dir, args)
      args[:include] = [".", "common/src/rb/lib", "common/test/rb/lib"] + Array(args[:include])
      args[:command] = args[:command] || "spec"
      args[:require] = Array(args[:require])

      # move?
      args[:srcs] = args[:srcs].map { |str| Dir[str] }.flatten
    end
  end

  class JRubyTest < RubyTasks
    def handle(fun, dir, args)
      require = ["third_party/jruby/json-jruby.jar"] + Array(args[:require])

      desc "Run ruby tests for #{dir} (jruby)"
      task task_name(dir, "test:jruby") do
        ENV['WD_SPEC_DRIVER'] = args[:driver_name] # TODO: get rid of ENV

        jruby :include => args[:include],
              :require => require,
              :command => args[:command],
              :files   => args[:srcs]
      end
    end
  end

  class MRITest < RubyTasks
    def handle(fun, dir, args)
      desc "Run ruby tests for #{dir} (mri)"
      task task_name(dir, "test:mri") do
        ENV['WD_SPEC_DRIVER'] = args[:driver_name] # TODO: get rid of this

        ruby :include => args[:include],
             :require => args[:require],
             :command => args[:command],
             :files   => args[:srcs]
      end
    end
  end

end # RubyMappings

class RubyRunner
  def self.run(impl, opts)
    cmd = []

    case impl.to_sym
    when :jruby
      cmd << "java"
      cmd << "-Djava.awt.headless=true" if opts[:headless]
      cmd << "-jar" << "third_party/jruby/jruby-complete-1.5.0.RC2.jar"
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



task :test_remote_rb => [:test_common, :remote_server] do
  ENV['WD_SPEC_DRIVER'] = 'remote'
  jruby :include  => [".", "common/src/rb/lib", "remote/client/src/rb/lib", "common/test/rb/lib"],
        :require  => ["third_party/jruby/json-jruby.jar", Dir["third_party/java/google-collect-*.jar"].first, "remote/client/lib/runtime/commons-httpclient-3.1.jar"],
        :command  => "-S spec",
        :files    => Dir['{common,remote/client}/test/rb/spec/**/*spec.rb']
        # :headless => true
end

task :test_ie_rb => :test_common do
  ENV['WD_SPEC_DRIVER'] = 'ie'
  jruby :include => [".", "common/src/rb/lib", "jobbie/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => "-X+O -S spec", # needs ObjectSpace
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

task :test_chrome_rb => :test_common do
  ENV['WD_SPEC_DRIVER'] = 'chrome'
  jruby :include => [".", "common/src/rb/lib", "chrome/src/rb/lib", "remote/client/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => "-S spec -fs",
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

#
# remote
#

task :test_remote_chrome_rb => :test_common do
  ENV['WD_SPEC_DRIVER'] = 'remote'
  ENV['WD_REMOTE_BROWSER'] = 'chrome'
  Rake::Task[:test_remote_rb].invoke
end

task :test_remote_firefox_rb => :firefox do
  ENV['WD_SPEC_DRIVER'] = 'remote'
  ENV['WD_REMOTE_BROWSER'] = 'firefox'
  Rake::Task[:test_remote_rb].invoke
end

task :test_remote_ie_rb => :ie do
  ENV['WD_SPEC_DRIVER'] = 'remote'
  ENV['WD_REMOTE_BROWSER'] = 'internet_explorer'
  Rake::Task[:test_remote_rb].invoke
end

task :test_remote_chrome_rb => :chrome do
  ENV['WD_SPEC_DRIVER'] = 'remote'
  ENV['WD_REMOTE_BROWSER'] = 'chrome'
  Rake::Task[:test_remote_rb].invoke
end

#
# docs
#

begin
  require 'yard'
  YARD::Rake::YardocTask.new(:rubydocs) do |t|
    t.files   += Dir['chrome/src/rb/lib/**/*.rb']
    t.files   += Dir['common/src/rb/lib/**/*.rb']
    t.files   += Dir['firefox/src/rb/lib/**/*.rb']
    t.files   += Dir['jobbie/src/rb/lib/**/*.rb']
    t.files   += Dir['remote/client/src/rb/lib/**/*.rb']
    t.options += %w[--verbose --readme common/src/rb/README --output-dir build/rubydocs]

    if ENV['minimal']
      t.options << "--no-private"
    end
  end
rescue LoadError
  task :rubydocs do
    abort "YARD is not available. In order to run yardoc, you must: sudo gem install yard"
  end
end


#
# gem
#

begin
  require "rubygems"
  require "rake/gempackagetask"

  PKG_DIR     = "build/gem"
  GEM_VERSION = ENV['VERSION'] ||= '0.0.0'
  GEM_SPEC    = Gem::Specification.new do |s|
   s.name          = 'selenium-webdriver'
   s.version       = GEM_VERSION
   s.summary       = "The next generation developer focused tool for automated testing of webapps"
   s.description   = "WebDriver is a tool for writing automated tests of websites. It aims to mimic the behaviour of a real user, and as such interacts with the HTML of the application."
   s.authors       = ["Jari Bakken"]
   s.email         = "jari.bakken@gmail.com"
   s.homepage      = "http://selenium.googlecode.com"

   s.add_dependency "json_pure"
   s.add_dependency "ffi"

   if s.respond_to? :add_development_dependency
     s.add_development_dependency "rspec"
     s.add_development_dependency "rack"
   end

   s.require_paths = []

   s.files         += FileList['COPYING']

   # Common
   s.require_paths << 'common/src/rb/lib'
   s.files         += FileList['common/src/rb/**/*']
   s.files         += FileList['common/src/js/**/*']

   # Firefox
   s.require_paths << 'firefox/src/rb/lib'
   s.files         += FileList['firefox/src/rb/**/*']
   s.files         += FileList['firefox/src/extension/**/*']
   s.files         += FileList['firefox/prebuilt/**/*']

   # Chrome
   s.require_paths << "chrome/src/rb/lib"
   s.files         += FileList['chrome/src/rb/**/*']
   s.files         += FileList['chrome/src/extension/**/*']
   s.files         += FileList['chrome/prebuilt/**/*.dll']

   # IE
   s.require_paths << 'jobbie/src/rb/lib'
   s.files         += FileList['jobbie/src/rb/**/*']
   s.files         += FileList['jobbie/prebuilt/**/InternetExplorerDriver.dll']

   # Remote
   s.require_paths << 'remote/client/src/rb/lib'
   s.files         += FileList['remote/client/src/rb/**/*']
  end

  namespace :gem do
    Rake::GemPackageTask.new(GEM_SPEC) do |pkg|
      pkg.package_dir = PKG_DIR
    end

    task :clean do
      rm_rf PKG_DIR
    end

    desc 'Build and release the ruby gem to Gemcutter'
    task :release => [:clean, :gem] do
      sh "gem push #{PKG_DIR}/#{GEM_SPEC.name}-#{GEM_SPEC.version}.gem"
    end
  end

rescue LoadError
  # $stderr.puts "rubygems not installed - gem tasks unavailable"
end
