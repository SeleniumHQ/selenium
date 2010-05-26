BrowserMob Proxy 1.0 by BrowserMob
http://proxy.browsermob.com

GETTING STARTED
===============================================================================

To get started, you need Java 1.6 installed. You can confirm by running:

java -version

The output should look like this:

java version "1.6.0_15"
Java(TM) SE Runtime Environment (build 1.6.0_15-b03-219)
Java HotSpot(TM) 64-Bit Server VM (build 14.1-b02-90, mixed mode)

Once you've confirmed Java is installed locally, simply run the following:

java -jar browsermob-proxy.jar

Then just point your browser to http://localhost:8081 to get started.

BUILDING FROM SOURCE
===============================================================================
You can grab the latest source at http://github.com/lightbody/browsermob-proxy

Once you have the source checked out (or wish to build the local source), just
run:

mvn assembly:assembly
java -jar target/browsermob-proxy-X.Y-SNAPSHOT-jar-with-dependencies.jar

Where "X.Y" is the latest development version.