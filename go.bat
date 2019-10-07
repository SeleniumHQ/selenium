@echo off
java -Xmx4096m -XX:MetaspaceSize=1024m -XX:ReservedCodeCacheSize=512m  --add-modules java.se --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/javax.crypto=ALL-UNNAMED -client -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
