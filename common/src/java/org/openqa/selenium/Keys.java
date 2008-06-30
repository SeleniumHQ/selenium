package org.openqa.selenium;

/**
 * Representations of pressable keys that aren't text. These are stored
 * as elements in the Unicode PUA.
 */
public enum Keys implements CharSequence {
	ARROW_LEFT('\uE001'),
	ARROW_UP('\uE002'),
	ARROW_RIGHT('\uE003'),
	ARROW_DOWN('\uE004'),
	BACK_SPACE('\uE005'),
	DELETE('\uE006'),
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
