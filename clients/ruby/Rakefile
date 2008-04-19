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

file "target/iedoc.xml" do
  # todo
end

desc "Generate driver from iedoc.xml"
file "lib/selenium/client/generated_driver" => [ "target/iedoc.xml" ] do
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

desc "Generate documentation"
Rake::RDocTask.new("rdoc") { |rdoc|
  rdoc.rdoc_dir = 'html'
  rdoc.title    = "Selenium Client"
  rdoc.options << '--line-numbers' << '--inline-source' << '--main' << 'README'
  rdoc.rdoc_files.include('README')
  rdoc.rdoc_files.include('lib/**/*.rb')
  rdoc.rdoc_files.include('doc/**/*.rdoc')
}

