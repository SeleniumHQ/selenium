# Rakefile for Selenium Ruby Client   -*- ruby -*-

$:.unshift 'lib'

require 'rubygems'
require 'rake/clean'
require 'rake/testtask'
require 'rake/packagetask'
require 'rake/gempackagetask'
require 'rake/rdoctask'

CLEAN.include("COMMENTS")
CLOBBER.include(
  'lib/selenium/client/generated_driver',
  '**/*.log'
)

task :default => :"test:unit"

file "target/iedoc.xml" do
  cp "iedoc.xml", "target/iedoc.xml"
end

desc "Generate driver from iedoc.xml"
file "lib/selenium/client/generated_driver.rb" => [ "target/iedoc.xml" ] do
  sh "ant generate-sources"
end

desc "Run unit tests"
Rake::TestTask.new(:'test:unit') do |t|
  t.test_files = FileList['test/unit/*.rb']
  t.warning = true
end

desc "Run integration tests"
Rake::TestTask.new(:'test:integration') do |t|
  t.test_files = FileList['test/integration/*.rb']
  t.warning = true
end

require 'spec/rake/spectask'
desc "Run tests in parallel"
Spec::Rake::SpecTask.new("test:parallel") do |t|
    t.spec_files = FileList['test/integration/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/screenshot_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::ScreenshotFormatter:./target/report.html"
    t.spec_opts << "--format=progress"                
end

task :"test:unit" => "lib/selenium/client/generated_driver.rb"
task :"test:integration" => "lib/selenium/client/generated_driver.rb"

specification = Gem::Specification.new do |s|
  s.name = "selenium-client"
  s.summary = "Official Ruby Client for Selenium RC."
  s.version = "1.1"
  s.author = "OpenQA"
	s.email = 'selenium-client@rubyforge.org'
  s.homepage = "http://selenium-client.rubyforge.com"
  s.rubyforge_project = 'selenium-client'
  s.platform = Gem::Platform::RUBY
  s.files = FileList['lib/**/*.rb']
  s.require_path = "lib"
  s.extensions = []
  s.rdoc_options << '--title' << 'Selenium Client' << '--main' << 'README' << '--line-numbers'
  s.has_rdoc = true
  s.extra_rdoc_files = ['README']
	s.test_file = "test/all_unit_tests.rb"
end

Rake::GemPackageTask.new(specification) do |package|
	 package.need_zip = false
	 package.need_tar = false
end
 
desc "Generate documentation"
Rake::RDocTask.new("rdoc") do |rdoc|
  rdoc.title    = "Selenium Client"
  rdoc.main = "README"
  rdoc.rdoc_dir = "doc"
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
  rdoc.rdoc_files.include('doc/**/*.rdoc')
  rdoc.options << '--line-numbers' << '--inline-source' 
end

