use Test::More tests => 1;
use Test::WWW::Selenium;

my $sel = Test::WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*firefox", 
                                      browser_url => "http://www.google.com",
                                    );
$sel->open("http://www.google.com");
$sel->type("q", "hello world");
$sel->click("btnG");
$sel->wait_for_page_to_load(5000);
$sel->title_like(qr/Google Search/);


