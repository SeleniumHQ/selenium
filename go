#!/bin/bash

java -jar third_party/jruby/jruby-complete-1.5.0.RC2.jar -r third_party/jruby/antwrap.jar -S rake $*
