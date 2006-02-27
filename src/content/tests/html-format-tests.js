function setUp() {
}

function testDecodeTextWithHtmlFormat() {
	options.escapeXmlEntities = "html";
	assertEquals("abc", decodeText("abc"));
	assertEquals("\xA0", decodeText("&#xA0;"));
	assertEquals("\xA0", decodeText("&#160;"));
	assertEquals("\xA0", decodeText("&nbsp;"));
}
function testEncodeTextWithHtmlFormat() {
	options.escapeXmlEntities = "html";
	assertEquals("&nbsp;", encodeText("\xA0"));
	assertEquals("'abc'", encodeText("'abc'"));
	assertEquals("&amp;amp;", encodeText("&amp;"));
	assertEquals("a=b&c=d", encodeText("a=b&c=d"));
	assertEquals("&foobar;", encodeText("&foobar;"));
}
