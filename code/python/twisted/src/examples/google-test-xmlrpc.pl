# Tested using ActiveState 5.8 perl (on Windows XP) + Frontier-RPC library
# To get and install Frontier:
# c:\> ppm
# ppm> install Frontier-RPC

use Frontier::Client;

# Make an object to represent the XML-RPC server.
$server_url = 'http://localhost:8080/selenium-driver/RPC2';
$server = Frontier::Client->new( 'url' => $server_url);

# Bump timeout a little higher than the default 5 seconds
$server->call('setTimeout',15);

system('start run_firefox.bat');

print $server->call('open','http://localhost:8080/AUT/000000A/http/www.google.com/');
print "\n";
print $server->call('verifyTitle','Google');
print "\n";
print $server->call('type','q','Selenium ThoughtWorks');
print "\n";
print $server->call('verifyValue','q','Selenium ThoughtWorks');
print "\n";
print $server->call('clickAndWait','btnG');
print "\n";
print $server->call('verifyTextPresent','selenium.thoughtworks.com','');
print "\n";
print $server->call('verifyTitle','Google Search: Selenium ThoughtWorks');
print "\n";
print $server->call('testComplete');
print "\n";