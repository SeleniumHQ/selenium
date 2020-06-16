@echo off
SETLOCAL

SET JAVA_OPTS=-client -Xmx4096m -XX:ReservedCodeCacheSize=512m

for /f tokens^=2-5^ delims^=.-_^" %%j in ('java -fullversion 2^>^&1') do set "jver=%%j.%%k"
IF "%jver%" == "1.8" GOTO :start

SET JAVA_OPTS=%JAVA_OPTS% --add-modules java.se --add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.io=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED --add-opens java.base/javax.crypto=ALL-UNNAMED

:start
java %JAVA_OPTS% -jar third_party\jruby\jruby-complete.jar -X-C -S rake %*
