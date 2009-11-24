Jetty start
-----------

Jetty start provides a cross platform replacement for startup scripts.
It makes use of executable JAR mechanism, which lets application packaged as JAR
to be started with simple command line:

  java -jar start.jar [jetty.xml ... ]

or to see debug output

  java -Dorg.mortbay.jetty.launcher.debug=true -jar start.jar [jetty.xml ... ]

What launcher does is:

- Figures out correct location of Jetty home directory.

- Configures classpath based on which JDK version it has been run with
and what classes are available (for example, someone might have servlet classes
in ext directory of JDK, or JSSE needs to be inlcuded on JDK 1.3 but is
built-in in JDK 1.4 etc.)
- Looks for Sun's JAVAC (required for Jasper JSP engine)
and puts it in classpath. For this to work, launcher has to be started
with JDK, not JRE!
- After classpath has been configured, it invokes org.mortbay.jetty.Server
with any command line arguments it received.
- When there are no commandline args, launcher starts Jetty Demo
(using configuration files etc/demo.xml and etc/admin.xml) and on Windows
platform it also attemts to invoke Internet Explorer with jetty demo URL
(http://localhost:8080/).

This means Windows users who have file type association for JAR files
setup to launch jar using JDK can now lauch jetty with simple
doubleclick on start.jar, or typing "start.jar" in shell window when in Jetty
home directory.

Any unknown JARs found in ext subdirectory of Jetty home will be
added to classpath. Users can place libraries common to multiple contexts there.
