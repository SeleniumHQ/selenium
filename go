#!/bin/bash

case `uname` in
        Darwin)
          JAVA_OPTS="-d32"
                ;;
        *)
          JAVA_OPTS="-client"
                ;;
esac

# we want jruby-complete to take care of all things ruby
unset GEM_HOME
unset GEM_PATH

java $JAVA_OPTS -jar third_party/jruby/jruby-complete.jar -X-C -S rake $*

