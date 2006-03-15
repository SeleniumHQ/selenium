Building:

To build this project, you need Maven 2.0.2 or higher. Once you have
Maven installed, simply execute:

mvn package

Running:

To run Selenium Server, run:

java -jar target/selenium-server-1.0-SNAPSHOT.jar [-port 8080]

Where:

 -port 
  is the port you wish to run the Server on (default is 8080)

Using:

Once Selenium Server is up and running, you can use it in two ways:

1) Client Configured Proxy (CCP)
2) Application Bridge (AB)

Using it as a CCP requires that you modify your web browser that will
run the tests to use a proxy. You should use the port specified with
the -port parameter.

Using it as an AB requires that you install your language-specified 
drivers (NOT YET AVAILABLE).