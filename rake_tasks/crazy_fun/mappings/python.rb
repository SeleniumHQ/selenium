require 'rake_tasks/selenium_rake/checks'

module Python
  def self.lib_dir
     Dir.glob('build/lib*')[0] || 'build/lib'
  end
end
