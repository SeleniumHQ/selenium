To use Selenium Proxy:

1) Launch Selenium Server:
    C:\Program Files\Selenium Proxy\bin\selenium_server.exe
    The server will listen on port 8080
    
2) Launch driver script:
    a) Open a command prompt window
    b) Change directories to C:\Program Files\Selenium Proxy\examples
    c) If you have changed the default installation directory for Firefox
       or Internet Explorer, or they are not on your "C:" drive, 
       verify that the path to your browser is correct in the files:
            run_firefox.bat
            run_IE.bat
       
       This needs to be fixed to pick up the browser path information
       from the Windows Registry at best, or a config file at worst.
       Also need a more formal hook to launch and kill the browser processes.
        
    d) Enter one of the following commands:
       Python:
       c:\Python23\python.exe google-test-xmlrpc.py
       
       Perl:
       c:\Perl\bin\perl.exe google-test-xmlrpc.pl
       
       Ruby:
       c:\ruby\bin\ruby.exe google-test-xmlrpc.rb
       
       Another option is to launch your Python, Perl, or Ruby in interactive
       mode and enter the commands found in the example scripts one by one.