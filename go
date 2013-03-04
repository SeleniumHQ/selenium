#!/bin/bash

# we want jruby-complete to take care of all things ruby
unset GEM_HOME
unset GEM_PATH

java -client \
     -Xmx2048m \
     -XX:MaxPermSize=1024m \
     -XX:ReservedCodeCacheSize=256m \
     -jar third_party/jruby/jruby-complete.jar \
     -X-C ./rake-tasks/main.rb $*

