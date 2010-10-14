require 'rake'
require 'rake/testtask'

Rake::TestTask.new do |t|
  t.libs << "test" << "lib"
  t.test_files = FileList["test/unit/**/*_tests.rb"]
end
