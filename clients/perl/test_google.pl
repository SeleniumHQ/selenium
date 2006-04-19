use WWW::Selenium;

my $sel = WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*iexplore", 
                                      browser_url => "http://www.google.com",
                                    );
$sel->start();
$sel->open("http://www.google.com");
$sel->type("q", "hello world");
$sel->click("btnG");
$sel->wait_for_page_to_load(5000);
print $sel->get_title();
$sel->stop();
