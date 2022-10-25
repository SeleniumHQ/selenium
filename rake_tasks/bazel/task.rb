module Bazel
  class Task < Rake::Task
    def needed?
      true
    end

    def invoke(*_args, &block)
      self.out = Bazel::execute("build", ["--workspace_status_command=\"#{py_exe} scripts/build-info.py\""], name, &block)

      block&.call(cmd_out)
    end
  end
end
