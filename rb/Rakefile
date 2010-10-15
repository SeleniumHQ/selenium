$:.unshift File.expand_path("../lib", __FILE__)

require 'bundler/setup'
require 'rake'
require 'rake/testtask'
require 'rake/clean'
require "spec/rake/spectask"
require "selenium/rake/tasks"

CLEAN << "target"

SELENIUM_SERVER_JAR = File.expand_path("../../build/selenium/server-with-tests-standalone.jar", __FILE__)
unless File.exist?(SELENIUM_SERVER_JAR)
  raise "could not find server jar: #{SELENIUM_SERVER_JAR.inspect}"
end

desc "Start a Selenium remote control, run all integration tests and stop the remote control"
task "ci:integration" => %w[clean test:unit] do
  Rake::Task[:"selenium:server:stop"].execute [] rescue nil
  begin
    Rake::Task[:"sample_app:restart"].execute []
    Rake::Task[:"selenium:server:start"].execute []
    Rake::Task[:"test:integration"].execute []
    Rake::Task[:"examples"].execute []
  ensure
    Rake::Task[:"selenium:server:stop"].execute []
    Rake::Task[:"sample_app:stop"].execute []
  end
end

Rake::TestTask.new("test:unit")do |t|
  t.libs << "test" << "lib"
  t.test_files = FileList["test/unit/**/*_tests.rb"]
  t.warning = true
end

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

Selenium::Rake::SeleniumServerStartTask.new do |rc|
  rc.port = 4444
  rc.timeout_in_seconds = 3 * 60
  rc.background = true
  rc.nohup = ENV['SELENIUM_RC_NOHUP'] == "true"
  rc.wait_until_up_and_running = true
  rc.jar_file = SELENIUM_SERVER_JAR
  rc.additional_args << "-singleWindow"
end

Selenium::Rake::SeleniumServerStopTask.new do |rc|
  rc.host = "localhost"
  rc.port = 4444
  rc.timeout_in_seconds = 3 * 60
  rc.wait_until_stopped = true
end

desc "Restart Selenium Server"
task :'selenium:server:restart' do
  Rake::Task[:"selenium:server:stop"].execute [] rescue nil
  Rake::Task[:"selenium:server:start"].execute []
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

desc "Launch Sample App"
task :'sample_app:start' do
  Nautilus::Shell.new.run \
      "\"#{File.expand_path(File.dirname(__FILE__) + '/test/integration/sample-app/sample_app.rb')}\"",
      :background => true
  TCPSocket.wait_for_service :host => "localhost", :port => 4567
end

desc "Stop Sample App"
task :'sample_app:stop' do
  Net::HTTP.get("localhost", '/shutdown', 4567)
end

desc "Restart Sample App"
task :'sample_app:restart' do
  Rake::Task[:"sample_app:stop"].execute([]) rescue nil
  Rake::Task[:"sample_app:start"].execute []
end

# TODO: docs in crazyfun
# TODO: gem  in crazyfun

