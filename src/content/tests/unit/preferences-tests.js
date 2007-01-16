function setUp() {
    this.Preferences = SeleniumIDE.Preferences;
}

function testArray() {
    Preferences.setString("test.array.length", 1);
    Preferences.setString("test.array.0", "foo");
    
    var array = Preferences.getArray("test.array");
    assertEquals(1, array.length);
    assertEquals("foo", array[0]);

    array.push("bar");
    Preferences.setArray("test.array", array);
    array = Preferences.getArray("test.array");
    assertEquals(2, array.length);
    assertEquals("foo", array[0]);
    assertEquals("bar", array[1]);
}
