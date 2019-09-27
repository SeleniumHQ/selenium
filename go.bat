@echo off
java -Xmx4096m -XX:MetaspaceSize=1024m -XX:ReservedCodeCacheSize=512m -client -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
