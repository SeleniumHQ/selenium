# Utility methods for generating tasks

# TODO(simon): Delete this. It's not working out dependencies correctly
$targets = {}
def build_deps_(srcs)
  deps = []

  return deps unless srcs

  Array(srcs).each do |src|
    deps += if $targets[src]
              $targets[src][:deps]
            else
              FileList[src]
            end
  end
  deps
end
