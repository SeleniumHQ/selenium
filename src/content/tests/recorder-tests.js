function setUp() {
}

function testAttachAndDetach() {
	var count = 0;
	Recorder.addHandler('test', 'click', function(event) {
			count++;
		});
	var recorder = new Recorder(window);
	var element = document.getElementById('theLink');
	assertNotNull(element);
	assertEquals(0, count);

	// the handler should be called
	triggerMouseEvent(element, 'click', true);
	assertEquals(1, count);

	recorder.detach();

	// the handler should not be called
	triggerMouseEvent(element, 'click', true);
	assertEquals(1, count);
}

function testRegisterAndRecordAndDeregister() {
	var count = 0;
	var observer = {
		addCommand: function(command, target, value, window) {
			assertEquals("test", command);
			count++;
		}
	};
	assertUndefined(window._Selenium_IDE_Recorder);
	var recorder = Recorder.register(observer, window);
	recorder.record("test", "aaa", "bbb");
	assertEquals(1, count);
	assertNotNull(window._Selenium_IDE_Recorder);
	recorder.deregister(observer);
	assertUndefined(window._Selenium_IDE_Recorder);
}
