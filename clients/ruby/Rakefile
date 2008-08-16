# Rakefile for Selenium Ruby Client   -*- ruby -*-

$:.unshift 'lib'

require 'rubygems'
require 'rake/clean'
require 'rake/testtask'
require 'rake/packagetask'
require 'rake/gempackagetask'
require 'rake/rdoctask'
require 'spec/rake/spectask'

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
  t.test_files = FileList['test/unit/**/*_test.rb']
  t.warning = true
end
task :"test:unit" => "lib/selenium/client/generated_driver.rb"

desc "Run all integration tests"
Spec::Rake::SpecTask.new("test:integration") do |t|
    t.spec_files = FileList['test/integration/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/integration_tests_report.html"
    t.spec_opts << "--format=progress"                
end
task :"test:integration" => ["lib/selenium/client/generated_driver.rb", :'test:integration:headless']

begin
  require "deep_test/rake_tasks"

  desc "Run all integration tests in parallel"
  Spec::Rake::SpecTask.new("test:integration:parallel") do |t|
      t.spec_files = FileList['test/integration/**/*.rb']
      t.spec_opts << '--color'
      t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
      t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/integration_tests_report.html"
      t.spec_opts << "--format=progress"                
      t.deep_test :number_of_workers => 5,
                  :timeout_in_seconds => 180
  end
rescue Exception
  puts "Could not find DeepTest, disbal parallel run"
end

desc "Run headless integration tests"
Rake::TestTask.new(:'test:integration:headless') do |t|
  t.test_files = FileList['test/integration/headless/**/*.rb']
  t.warning = true
end

desc "Run API integration tests"
Spec::Rake::SpecTask.new("test:integration:api") do |t|
    t.spec_files = FileList['test/integration/api/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/api_integration_tests_report.html"
    t.spec_opts << "--format=progress"                
end

desc "Run API integration tests"
Spec::Rake::SpecTask.new("test:integration:smoke") do |t|
    t.spec_files = FileList['test/integration/smoke/**/*backward*.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/smoke_tests_report.html"
    t.spec_opts << "--format=progress"                
end

desc "Run tests that are part of Selenium RC maven build (When Selenium Client is part of Selenium RC Workspace)."
task :'test:maven_build' do |t|
  Rake::Task[:"test:unit"].invoke
  
  if (ENV['HEADLESS_TEST_MODE'] || "").downcase == "true"
    puts "Headless test mode detected"
    Rake::Task[:"test:integration:headless"].invoke
  else
    Rake::Task[:"test:integration:headless"].invoke
    Rake::Task[:"test:integration:api"].invoke
    Rake::Task[:"test:integration:smoke"].invoke
  end

end

desc "Run tests in parallel"
Spec::Rake::SpecTask.new("test:parallel") do |t|
    t.spec_files = FileList['test/integration/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/report.html"
    t.spec_opts << "--format=progress"                
end


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

