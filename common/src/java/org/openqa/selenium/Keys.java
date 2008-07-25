package org.openqa.selenium;

/**
 * Representations of pressable keys that aren't text. These are stored
 * as elements in the Unicode PUA.
 */
public enum Keys implements CharSequence {

	NULL         ('\uE000'),
	CANCEL       ('\uE001'), // ^break
	HELP         ('\uE002'),
	BACK_SPACE   ('\uE003'),
	TAB          ('\uE004'),
	CLEAR        ('\uE005'),
	RETURN       ('\uE006'),
	ENTER        ('\uE007'),
	SHIFT        ('\uE008'),
	LEFT_SHIFT   ('\uE008'), // alias
	CONTROL      ('\uE009'),
	LEFT_CONTROL ('\uE009'), // alias
	ALT          ('\uE00A'),
	LEFT_ALT     ('\uE00A'), // alias
	PAUSE        ('\uE00B'),
	ESCAPE       ('\uE00C'),
	SPACE        ('\uE00D'),
	PAGE_UP      ('\uE00E'),
	PAGE_DOWN    ('\uE00F'),
	END          ('\uE010'),
	HOME         ('\uE011'),
	LEFT         ('\uE012'),
	ARROW_LEFT   ('\uE012'), // alias
	UP           ('\uE013'),
	ARROW_UP     ('\uE013'), // alias
	RIGHT        ('\uE014'),
	ARROW_RIGHT  ('\uE014'), // alias
	DOWN         ('\uE015'),
	ARROW_DOWN   ('\uE015'), // alias
	INSERT       ('\uE016'),
	DELETE       ('\uE017'),
	;

	private Keys(char keyCode) {
		this.keyCode = keyCode;
	}
	
	public char charAt(int index) {
		if (index == 0)
			return keyCode;
		return 0;
	}

	public int length() {
		return 1;
	}

	public CharSequence subSequence(int start, int end) {
		if (start == 0 && end == 1)
			return String.valueOf(keyCode);
		
		throw new IndexOutOfBoundsException();
	}
	
	@Override
	public String toString() {
		return String.valueOf(keyCode);
	}
	
	private char keyCode;
}
