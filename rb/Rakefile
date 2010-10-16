$:.unshift File.expand_path("../lib", __FILE__)

require 'bundler/setup'
require 'rake'
require 'rake/testtask'
require 'rake/clean'
require "spec/rake/spectask"
require "selenium/rake/tasks"
require "rcov/rcovtask"

CLEAN << "target"

Spec::Rake::SpecTask.new("test:integration") do |t|
  t.libs << "test/integration"
  t.spec_files = FileList["test/integration/**/*_spec.rb"] - FileList['test/integration/**/dummy_project/*_spec.rb']
end

desc "Run API integration tests"
Spec::Rake::SpecTask.new("test:integration:api") do |t|
    t.spec_files = FileList['test/integration/api/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/api_integration_tests_report.html"
    t.spec_opts << "--format=progress"
end

desc "Run smoke integration tests"
Spec::Rake::SpecTask.new("test:integration:smoke") do |t|
    t.spec_files = FileList['test/integration/smoke/**/*backward*.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/smoke_tests_report.html"
    t.spec_opts << "--format=progress"
end


desc "Run Test::Unit example"
Rake::TestTask.new("examples:testunit"  ) do |t|
  t.test_files = FileList['examples/testunit/**/*_test.rb']
  t.warning = true
end

desc "Run RSpec examples"
Spec::Rake::SpecTask.new("examples:rspec") do |t|
    t.spec_files = FileList['examples/rspec/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/smoke_tests_report.html"
    t.spec_opts << "--format=progress"
end

task :defult => :unit

# ____ original rakefile __

desc "Run API integration tests"
Spec::Rake::SpecTask.new("test:integration:api") do |t|
    t.spec_files = FileList['test/integration/api/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/api_integration_tests_report.html"
    t.spec_opts << "--format=progress"
end

desc "Run Smoke integration tests"
Spec::Rake::SpecTask.new("test:integration:smoke") do |t|
    t.spec_files = FileList['test/integration/smoke/**/*backward*.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/smoke_tests_report.html"
    t.spec_opts << "--format=progress"
end

desc "Run Test::Unit example"
Rake::TestTask.new("examples:testunit"  ) do |t|
  t.test_files = FileList['examples/testunit/**/*_test.rb']
  t.warning = true
end

desc "Run RSpec examples"
Spec::Rake::SpecTask.new("examples:rspec") do |t|
    t.spec_files = FileList['examples/rspec/**/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/smoke_tests_report.html"
    t.spec_opts << "--format=progress"
end

desc "Run script example"
task :'examples:script' do
  sh "ruby examples/script/*.rb"
end

desc "Run all examples"
task :'examples' => [:'examples:rspec', :'examples:testunit', :'examples:script']

desc "Run tests in parallel"
Spec::Rake::SpecTask.new("test:parallel") do |t|
    t.spec_files = FileList['test/integration/*_spec.rb']
    t.spec_opts << '--color'
    t.spec_opts << "--require 'lib/selenium/rspec/reporting/selenium_test_report_formatter'"
    t.spec_opts << "--format=Selenium::RSpec::SeleniumTestReportFormatter:./target/report.html"
    t.spec_opts << "--format=progress"
end

