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

task :"test:unit" => "lib/selenium/client/generated_driver.rb"
task :"test:integration" => "lib/selenium/client/generated_driver.rb"
 
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

