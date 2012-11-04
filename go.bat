@echo off

java -Xmx2048m -XX:MaxPermSize=1024m -XX:ReservedCodeCacheSize=256m -client -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
