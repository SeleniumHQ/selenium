#!/bin/bash

java -d32 -jar third_party/jruby/jruby-complete.jar -X-C -S rake $*
