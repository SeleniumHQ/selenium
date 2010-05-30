@echo off
java -Djruby.launch.inproc=false -jar third_party\jruby\jruby-complete-1.5.0.RC2.jar -S rake %*
