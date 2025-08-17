#!/usr/bin/env bash

# we want jruby-complete to take care of all things ruby
unset GEM_HOME
unset GEM_PATH

JAVA_OPTS="-client -Xmx4096m -XX:ReservedCodeCacheSize=512m -XX:MetaspaceSize=1024m --add-modules java.se --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/javax.crypto=ALL-UNNAMED"

# This code supports both:
# ./go "namespace:task[--arg1,--arg2]" --rake-flag
# ./go namespace:task --arg1 --arg2 -- --rake-flag

# The first argument is always the Rake task name
task="$1"
shift

# Initialize arrays for rake flags and task arguments
rake_flags=()
task_args=()

# Arguments before -- are task arguments
while [ $# -gt 0 ]; do
  if [ "$1" = "--" ]; then
    shift
    break
  fi
  task_args+=("$1")
  shift
done

# Remaining arguments are rake flags
rake_flags=("$@")

# If we have task args, format them
if [ ${#task_args[@]} -gt 0 ]; then
  # Convert task args array to comma-separated string
  args=$(IFS=','; echo "${task_args[*]}")
  task="$task[$args]"
  echo "Executing rake task: $task"
fi


java $JAVA_OPTS -jar third_party/jruby/jruby-complete.jar -X-C -S rake $task "${rake_flags[@]}"
