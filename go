#!/usr/bin/env bash

# we want jruby-complete to take care of all things ruby
unset GEM_HOME
unset GEM_PATH

JAVA_OPTS="-client -Xmx4096m -XX:ReservedCodeCacheSize=512m -XX:MetaspaceSize=1024m --add-modules java.se --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/javax.crypto=ALL-UNNAMED"

java $JAVA_OPTS -jar third_party/jruby/jruby-complete.jar -X-C -S rake $*

