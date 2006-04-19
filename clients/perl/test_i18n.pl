use WWW::Selenium;

$sel = WWW::Selenium->new( host => "localhost", 
                                      port => 4444, 
                                      browser => "*firefox", 
                                      browser_url => "http://localhost:4444",
                                    );
$sel->start();
$sel->open("/selenium-server/tests/html/test_i18n.html");
$romance = "\xC3\xBC\xC3\xB6\xC3\xA4\xC3\x9C\xC3\x96\xC3\x84 \xC3\xA7\xC3\xA8\xC3\xA9 \xC2\xBF\xC3\xB1 \xC3\xA8\xC3\xA0\xC3\xB9\xC3\xB2";
$korean = "\xEC\x97\xB4\xEC\x97\x90";
$chinese = "\xE4\xB8\xAD\xE6\x96\x87";
$japanese = "\xE3\x81\xBE\xE3\x81\xB7";
verify_text($romance, "romance");
verify_text($korean, "korean");
verify_text($chinese, "chinese");
verify_text($japanese, "japanese");
$sel->stop();


sub verify_text {
	my $expected = shift;
	my $id = shift;
	$sel->assert_text_present($expected);
	my $actual = $sel->get_text($id);
	if ($actual eq $expected) {
		print "OK\n";
	} else {
		"not equal, expected <$expected> but was <$actual>\n";
	}
}