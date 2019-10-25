# module CrazyFun
#   module Mappings
#     class ExportMappings
#       # TODO: LH - Check the usage of this. It seems it isn't consumed
#       # If so all downstream fun mappings (Export::), can be removed
#       def add_all(fun)
#         fun.add_mapping("export_file", Export::CheckPreconditions.new)
#         fun.add_mapping("export_file", Export::CreateTask.new)
#         fun.add_mapping("export_file", Export::AddDependencies.new)
#       end
#     end
#   end
# end
