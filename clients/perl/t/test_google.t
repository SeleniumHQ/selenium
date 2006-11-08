use Test::WWW::Selenium;

use lib 't/lib';
use SeleniumUtil qw(server_is_running);
use Test::More;
if (server_is_running) {
    plan tests => 1;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}


my $sel = Test::WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*firefox", 
                                      browser_url => "http://www.google.com/webhp",
                                    );
$sel->open("http://www.google.com/webhp");
$sel->type("q", "hello world");
$sel->click("btnG");
$sel->wait_for_page_to_load(5000);
$sel->title_like(qr/Google Search/);


