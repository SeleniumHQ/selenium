require 'rake_tasks/crazy_fun/mappings/common'

require_relative 'rename/add_dependencies'
require_relative 'rename/check_preconditions'
require_relative 'rename/export'

class RenameMappings
  def add_all(fun)
    fun.add_mapping("rename", Rename::CheckPreconditions.new)
    fun.add_mapping("rename", Rename::AddDependencies.new)
    fun.add_mapping("rename", Rename::Export.new)
  end
end
