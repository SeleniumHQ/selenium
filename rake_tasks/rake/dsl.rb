module Rake
  module DSL
    def bazel(*args, &block)
      Bazel::Task.define_task(*args, &block)
    end
  end
end
