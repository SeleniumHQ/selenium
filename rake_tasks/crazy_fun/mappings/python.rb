require 'rake'
require 'rake_tasks/selenium_rake/checks'
require 'rake_tasks/buck.rb'
require 'rake_tasks/crazy_fun/mappings/common'

require_relative 'python_mappings'

require_relative 'python/add_dependencies'
require_relative 'python/add_normal_dependencies'
require_relative 'python/py_task'
require_relative 'python/run_tests'

module Python
  def self.lib_dir
     Dir.glob('build/lib*')[0] || 'build/lib'
  end
end
