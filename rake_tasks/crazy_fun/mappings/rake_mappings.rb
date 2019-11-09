require_relative 'rake_mappings/check_preconditions'
require_relative 'rake_mappings/create_task'
require_relative 'rake_mappings/check_file_preconditions'
require_relative 'rake_mappings/create_file_task'
require_relative 'rake_mappings/create_short_task'

module CrazyFun
  module Mappings
    class RakeMappings
      def add_all(fun)
        fun.add_mapping("rake_task", CrazyFun::Mappings::RakeMappings::CheckPreconditions.new)
        fun.add_mapping("rake_task", CrazyFun::Mappings::RakeMappings::CreateTask.new)
        fun.add_mapping("rake_task", CrazyFun::Mappings::RakeMappings::CreateShortTask.new)

        fun.add_mapping("rake_task", CrazyFun::Mappings::RakeMappings::CheckFilePreconditions.new)
        fun.add_mapping("rake_task", CrazyFun::Mappings::RakeMappings::CreateFileTask.new)
        fun.add_mapping("rake_file", CrazyFun::Mappings::RakeMappings::CreateShortTask.new)
      end
    end
  end
end
