#!/bin/bash

# we want jruby-complete to take care of all things ruby
unset GEM_HOME
unset GEM_PATH

JAVA_OPTS="-client"

java $JAVA_OPTS -Xmx900m -XX:MaxPermSize=384m -XX:ReservedCodeCacheSize=128m -jar third_party/jruby/jruby-complete.jar -X-C -S rake $*

