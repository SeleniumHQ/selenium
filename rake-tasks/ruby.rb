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
        :command => "-d -S spec -fs",
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

task :test_firefox_rb => :test_common do
  ENV['WD_SPEC_DRIVER'] = 'firefox'
  jruby :include => [".", "common/src/rb/lib", "firefox/src/rb/lib", "remote/client/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => '-S spec',
        :files   => Dir['{common,firefox}/test/rb/spec/**/*spec.rb']
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
