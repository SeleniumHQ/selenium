@echo off

java -Xmx900m -XX:MaxPermSize=384m -XX:ReservedCodeCacheSize=128m -client -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
