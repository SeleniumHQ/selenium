This temp directory is used by the JVM for temporary file storage.
The JVM is configured to use this as its java.io.tmpdir in the
catalina.sh and catalina.bat scripts.  Tomcat is configured to use
this temporary directory rather than its default for security reasons.
The temp directory must exist for Tomcat to work correctly.
