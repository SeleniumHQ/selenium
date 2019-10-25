require 'rake_tasks/selenium_rake/checks'

require_relative 'python/add_normal_dependencies'
require_relative 'python/py_task'

module Python
  def self.lib_dir
     Dir.glob('build/lib*')[0] || 'build/lib'
  end
end
