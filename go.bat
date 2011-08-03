@echo off

java -client -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
