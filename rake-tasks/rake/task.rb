# Moved from task-gen.rb
module Rake
  class Task
    attr_accessor :deps, :out
  end
end

module Rake
  class Task
    attr_accessor :out
  end
end
