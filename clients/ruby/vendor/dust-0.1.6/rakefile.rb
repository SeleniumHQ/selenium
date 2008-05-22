require 'rubygems'
require 'rake/gempackagetask'
require 'rake/rdoctask'
require 'rake/contrib/sshpublisher'

task :default => :test

task :test do
  require File.dirname(__FILE__) + '/test/all_tests.rb'
end

desc 'Generate RDoc'
Rake::RDocTask.new do |task|
  task.main = 'README'
  task.title = 'Dust'
  task.rdoc_dir = 'doc'
  task.options << "--line-numbers" << "--inline-source"
  task.rdoc_files.include('README', 'lib/**/*.rb')
end

desc "Upload RDoc to RubyForge"
task :publish_rdoc => [:rdoc] do
  Rake::SshDirPublisher.new("jaycfields@rubyforge.org", "/var/www/gforge-projects/dust", "doc").upload
end

Gem::manage_gems

specification = Gem::Specification.new do |s|
	s.name   = "dust"
  s.summary = "Dust is an add on for Test::Unit that allows an alternative test definintion syntax."
	s.version = "0.1.6"
	s.author = 'Jay Fields'
	s.description = "Dust is an add on for Test::Unit that allows an alternative test definintion syntax."
	s.email = 'dust-developer@rubyforge.org'
  s.homepage = 'http://dust.rubyforge.org'
  s.rubyforge_project = 'dust'

  s.has_rdoc = true
  s.extra_rdoc_files = ['README']
  s.rdoc_options << '--title' << 'Dust' << '--main' << 'README' << '--line-numbers'

  s.autorequire = 'dust'
  s.files = FileList['{lib,test}/**/*.rb', '[A-Z]*$', 'rakefile.rb'].to_a
	s.test_file = "test/all_tests.rb"
end

Rake::GemPackageTask.new(specification) do |package|
  package.need_zip = false
  package.need_tar = false
end