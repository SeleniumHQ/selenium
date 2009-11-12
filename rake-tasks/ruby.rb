task :test_remote_rb => [:test_common, :remote_server] do
  jruby :include  => [".", "common/src/rb/lib", "remote/client/src/rb/lib", "common/test/rb/lib"],
        :require  => ["third_party/jruby/json-jruby.jar"],
        :command  => "-S spec",
        :files    => Dir['common/test/rb/spec/**/*spec.rb']
        # :headless => true
end

task :test_ie_rb => :test_common do
  jruby :include => [".", "common/src/rb/lib", "jobbie/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => "-X+O -S spec", # needs ObjectSpace
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

task :test_chrome_rb => :test_common do
  jruby :include => [".", "common/src/rb/lib", "chrome/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => "-S spec",
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

task :test_firefox_rb => :test_common do
  jruby :include => [".", "common/src/rb/lib", "firefox/src/rb/lib", "common/test/rb/lib"],
        :require => ["third_party/jruby/json-jruby.jar"],
        :command => "-S spec ",
        :files   => Dir['common/test/rb/spec/**/*spec.rb']
end

#
# remote
# 

task :test_remote_chrome_rb => :test_common do
  ENV['REMOTE_BROWSER_VERSION'] = 'chrome'
  Rake::Task[:test_remote_rb].invoke # bad
end

task :test_remote_firefox_rb => :firefox do
  ENV['REMOTE_BROWSER_VERSION'] = 'firefox'
  Rake::Task[:test_remote_rb].invoke # bad
end

task :test_remote_ie_rb => :ie do
  ENV['REMOTE_BROWSER_VERSION'] = 'internet_explorer'
  Rake::Task[:test_remote_rb].invoke # bad
end

task :test_remote_chrome_rb => :chrome do
  ENV['REMOTE_BROWSER_VERSION'] = 'chrome'
  Rake::Task[:test_remote_rb].invoke # bad
end

#
# gem
# 

begin
  require "rubygems"
  require "rake/gempackagetask"
  
  GEM_VERSION = ENV['VERSION'] ||= '0.0.1'
  GEM_SPEC    = Gem::Specification.new do |s|
   s.name          = 'selenium-webdriver'
   s.version       = GEM_VERSION
   s.summary       = "The next generation developer focused tool for automated testing of webapps"
   s.description   = "WebDriver is a tool to automate various browsers throug a common API"
   s.authors       = ["Jari Bakken"]
   s.email         = "jari.bakken@gmail.com"
   s.homepage      = "http://selenium.googlecode.com"
   
   s.add_dependency "json_pure"
   s.add_dependency "ffi"
   s.add_development_dependency "rspec"
   s.add_development_dependency "rack"

   s.require_paths = []
   
   # Common
   s.require_paths << 'common/src/rb/lib'
   s.files         += FileList['common/src/rb/**/*']
   s.files         += FileList['common/src/js/**/*']
   
   # Firefox
   s.require_paths << 'firefox/src/rb/lib'
   s.files         += FileList['firefox/src/rb/**/*']
   s.files         += FileList['firefox/src/extension/**/*']
   s.files         += FileList['firefox/prebuilt/*.xpt']
   
   # IE
   s.require_paths << 'jobbie/src/rb/lib'
   s.files         += FileList['jobbie/src/rb/**/*']
   
   # Remote
   s.require_paths << 'remote/client/src/rb/lib'
   s.files         += FileList['remote/client/src/rb/**/*']
  end
  
  namespace :gem do
    # desc 'Create ruby gem'
    Rake::GemPackageTask.new(GEM_SPEC) do |pkg|
      pkg.package_dir = "build"
    end
    
    # desc 'Release the ruby gem to Gemcutter'
    # task :release do
    #   begin
    #     require 'gemcutter'
    #     sh "gem push build/#{GEM_SPEC.name}-#{GEM_VERSION}.gem"
    #   rescue LoadError
    #     $stderr.puts "you need to install the gemcutter gem: `(sudo) gem install gemcutter`"
    #   end
    # end
  end
  
rescue LoadError 
  # $stderr.puts "rubygems not installed - gem tasks unavailable"
end