#!/bin/bash

case `uname` in
        Darwin)
          JAVA_OPTS="-d32"
                ;;
        *)
          JAVA_OPTS="-client"
                ;;
esac

java $JAVA_OPTS -jar third_party/jruby/jruby-complete.jar -X-C -S rake $*

