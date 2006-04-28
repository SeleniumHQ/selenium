use Test::WWW::Selenium;

use lib 't/lib';
use SeleniumUtil qw(server_is_running);
use Test::More;
if (server_is_running) {
    plan tests => 5;
}
else {
    plan skip_all => "No selenium server found!";
    exit 0;
}


$sel = Test::WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*firefox", 
                                      browser_url => "http://localhost:4444",
                                    );
$sel->open("/selenium-server/tests/html/test_i18n.html");

$romance = "\x{00FC}\x{00F6}\x{00E4}\x{00DC}\x{00D6}\x{00C4} \x{00E7}\x{00E8}\x{00E9} \x{00BF}\x{00F1} \x{00E8}\x{00E0}\x{00F9}\x{00F2}";
$korean = "\x{C5F4}\x{C5D0}";
$chinese = "\x{4E2D}\x{6587}";
$japanese = "\x{307E}\x{3077}";
$dangerous = "&%?\\+|,%*";

verify_text($romance, "romance");
verify_text($korean, "korean");
verify_text($chinese, "chinese");
verify_text($japanese, "japanese");
verify_text($dangerous, "dangerous");

sub verify_text {
	my $expected = shift;
	my $id = shift;
	$sel->assert_text_present($expected);
	$sel->text_is($id, $expected);
}