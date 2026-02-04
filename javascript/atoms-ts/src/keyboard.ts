// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

/**
 * The file contains an abstraction of a keyboard
 * for simulating the pressing and releasing of keys.
 */

import { Device, ModifiersState, Modifier } from './device';
import { WebDriverError, ErrorCode } from './error';
import * as dom from './dom';
import * as events from './events';
import * as userAgent from './userAgent';

/**
 * A key on the keyboard.
 */
export class Key {
    /**
     * Keycode for the key; null for the (rare) case
     * that pressing the key issues no key events.
     */
    code: number | null;

    /**
     * Character when shift is not pressed; null
     * when the key does not cause a character to be typed.
     */
    character: string | null;

    /**
     * Character when shift is pressed; null
     * when the key does not cause a character to be typed.
     */
    shiftChar: string | null;

    constructor(code: number | null, opt_char?: string, opt_shiftChar?: string) {
        this.code = code;
        this.character = opt_char || null;
        this.shiftChar = opt_shiftChar || this.character;
    }

    /**
     * Given a character, returns a pair of a key and a boolean: the key being one
     * that types the character and the boolean indicating whether the key must be
     * shifted to type it.
     */
    static fromChar(ch: string): { key: Key; shift: boolean } {
        if (ch.length !== 1) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Argument not a single character: ' + ch);
        }
        let keyShiftPair = CHAR_TO_KEY_[ch];
        if (!keyShiftPair) {
            const upperCase = ch.toUpperCase();
            const keyCode = upperCase.charCodeAt(0);
            const key = newKey_(keyCode, ch.toLowerCase(), upperCase);
            keyShiftPair = { key, shift: (ch !== key.character) };
        }
        return keyShiftPair;
    }
}

/**
 * Maps characters to (key,boolean) pairs
 */
const CHAR_TO_KEY_: Record<string, { key: Key; shift: boolean }> = {};

/**
 * Constructs a new key and, if it is a character key, adds a mapping from the
 * character to is in the CHAR_TO_KEY_ map.
 */
function newKey_(code: number | { gecko?: number | null; ieWebkit?: number | null } | null, opt_char?: string, opt_shiftChar?: string): Key {
    let finalCode: number | null = code as number | null;
    if (typeof code === 'object' && code !== null) {
        if (userAgent.IS_FIREFOX) {
            finalCode = code.gecko ?? null;
        } else {  // IE and Webkit
            finalCode = code.ieWebkit ?? null;
        }
    }
    const key = new Key(finalCode, opt_char, opt_shiftChar);

    // For a character key, potentially map the character to the key in the
    // CHAR_TO_KEY_ map. Because of numpad, multiple keys may have the same
    // character. To avoid mapping numpad keys, we overwrite a mapping only if
    // the key has a distinct shift character.
    if (opt_char && (!(opt_char in CHAR_TO_KEY_) || opt_shiftChar)) {
        CHAR_TO_KEY_[opt_char] = { key, shift: false };
        if (opt_shiftChar) {
            CHAR_TO_KEY_[opt_shiftChar] = { key, shift: true };
        }
    }

    return key;
}

/**
 * The set of keys known to this module.
 */
export const Keys = {
    BACKSPACE: newKey_(8),
    TAB: newKey_(9),
    ENTER: newKey_(13),
    SHIFT: newKey_(16),
    CONTROL: newKey_(17),
    ALT: newKey_(18),
    PAUSE: newKey_(19),
    CAPS_LOCK: newKey_(20),
    ESC: newKey_(27),
    SPACE: newKey_(32, ' '),
    PAGE_UP: newKey_(33),
    PAGE_DOWN: newKey_(34),
    END: newKey_(35),
    HOME: newKey_(36),
    LEFT: newKey_(37),
    UP: newKey_(38),
    RIGHT: newKey_(39),
    DOWN: newKey_(40),
    PRINT_SCREEN: newKey_(44),
    INSERT: newKey_(45),
    DELETE: newKey_(46),

    // Number keys
    ZERO: newKey_(48, '0', ')'),
    ONE: newKey_(49, '1', '!'),
    TWO: newKey_(50, '2', '@'),
    THREE: newKey_(51, '3', '#'),
    FOUR: newKey_(52, '4', '$'),
    FIVE: newKey_(53, '5', '%'),
    SIX: newKey_(54, '6', '^'),
    SEVEN: newKey_(55, '7', '&'),
    EIGHT: newKey_(56, '8', '*'),
    NINE: newKey_(57, '9', '('),

    // Letter keys
    A: newKey_(65, 'a', 'A'),
    B: newKey_(66, 'b', 'B'),
    C: newKey_(67, 'c', 'C'),
    D: newKey_(68, 'd', 'D'),
    E: newKey_(69, 'e', 'E'),
    F: newKey_(70, 'f', 'F'),
    G: newKey_(71, 'g', 'G'),
    H: newKey_(72, 'h', 'H'),
    I: newKey_(73, 'i', 'I'),
    J: newKey_(74, 'j', 'J'),
    K: newKey_(75, 'k', 'K'),
    L: newKey_(76, 'l', 'L'),
    M: newKey_(77, 'm', 'M'),
    N: newKey_(78, 'n', 'N'),
    O: newKey_(79, 'o', 'O'),
    P: newKey_(80, 'p', 'P'),
    Q: newKey_(81, 'q', 'Q'),
    R: newKey_(82, 'r', 'R'),
    S: newKey_(83, 's', 'S'),
    T: newKey_(84, 't', 'T'),
    U: newKey_(85, 'u', 'U'),
    V: newKey_(86, 'v', 'V'),
    W: newKey_(87, 'w', 'W'),
    X: newKey_(88, 'x', 'X'),
    Y: newKey_(89, 'y', 'Y'),
    Z: newKey_(90, 'z', 'Z'),

    // Branded keys
    META: newKey_(
        userAgent.IS_WINDOWS ? { gecko: 91, ieWebkit: 91 } :
            (userAgent.IS_MAC ? { gecko: 224, ieWebkit: 91 } :
                { gecko: 0, ieWebkit: 91 })),  // Linux
    META_RIGHT: newKey_(
        userAgent.IS_WINDOWS ? { gecko: 92, ieWebkit: 92 } :
            (userAgent.IS_MAC ? { gecko: 224, ieWebkit: 93 } :
                { gecko: 0, ieWebkit: 92 })),  // Linux
    CONTEXT_MENU: newKey_(
        userAgent.IS_WINDOWS ? { gecko: 93, ieWebkit: 93 } :
            (userAgent.IS_MAC ? { gecko: 0, ieWebkit: 0 } :
                { gecko: 93, ieWebkit: null })),  // Linux

    // Numpad keys
    NUM_ZERO: newKey_({ gecko: 96, ieWebkit: 96 }, '0'),
    NUM_ONE: newKey_({ gecko: 97, ieWebkit: 97 }, '1'),
    NUM_TWO: newKey_({ gecko: 98, ieWebkit: 98 }, '2'),
    NUM_THREE: newKey_({ gecko: 99, ieWebkit: 99 }, '3'),
    NUM_FOUR: newKey_({ gecko: 100, ieWebkit: 100 }, '4'),
    NUM_FIVE: newKey_({ gecko: 101, ieWebkit: 101 }, '5'),
    NUM_SIX: newKey_({ gecko: 102, ieWebkit: 102 }, '6'),
    NUM_SEVEN: newKey_({ gecko: 103, ieWebkit: 103 }, '7'),
    NUM_EIGHT: newKey_({ gecko: 104, ieWebkit: 104 }, '8'),
    NUM_NINE: newKey_({ gecko: 105, ieWebkit: 105 }, '9'),
    NUM_MULTIPLY: newKey_(
        { gecko: 106, ieWebkit: 106 }, '*'),
    NUM_PLUS: newKey_(
        { gecko: 107, ieWebkit: 107 }, '+'),
    NUM_MINUS: newKey_(
        { gecko: 109, ieWebkit: 109 }, '-'),
    NUM_PERIOD: newKey_(
        { gecko: 110, ieWebkit: 110 }, '.'),
    NUM_DIVISION: newKey_(
        { gecko: 111, ieWebkit: 111 }, '/'),
    NUM_LOCK: newKey_(144),

    // Function keys
    F1: newKey_(112),
    F2: newKey_(113),
    F3: newKey_(114),
    F4: newKey_(115),
    F5: newKey_(116),
    F6: newKey_(117),
    F7: newKey_(118),
    F8: newKey_(119),
    F9: newKey_(120),
    F10: newKey_(121),
    F11: newKey_(122),
    F12: newKey_(123),

    // Punctuation keys
    EQUALS: newKey_(
        { gecko: 107, ieWebkit: 187 }, '=', '+'),
    SEPARATOR: newKey_(108, ','),
    HYPHEN: newKey_(
        { gecko: 109, ieWebkit: 189 }, '-', '_'),
    COMMA: newKey_(188, ',', '<'),
    PERIOD: newKey_(190, '.', '>'),
    SLASH: newKey_(191, '/', '?'),
    BACKTICK: newKey_(192, '`', '~'),
    OPEN_BRACKET: newKey_(219, '[', '{'),
    BACKSLASH: newKey_(220, '\\', '|'),
    CLOSE_BRACKET: newKey_(221, ']', '}'),
    SEMICOLON: newKey_(
        { gecko: 59, ieWebkit: 186 }, ';', ':'),
    APOSTROPHE: newKey_(222, '\'', '"')
};

/**
 * Array of modifier keys.
 */
const MODIFIERS = [
    Keys.ALT,
    Keys.CONTROL,
    Keys.META,
    Keys.SHIFT
];

/**
 * Map of modifier to key.
 */
const MODIFIER_TO_KEY_MAP_: Map<Modifier, Key> = new Map([
    [Modifier.SHIFT, Keys.SHIFT],
    [Modifier.CONTROL, Keys.CONTROL],
    [Modifier.ALT, Keys.ALT],
    [Modifier.META, Keys.META]
]);

/**
 * The reverse map - key to modifier.
 */
const KEY_TO_MODIFIER_: Map<number | null, Modifier> = new Map();

// Build reverse map
MODIFIER_TO_KEY_MAP_.forEach((key, modifier) => {
    if (key.code !== null) {
        KEY_TO_MODIFIER_.set(key.code, modifier);
    }
});

/**
 * The value used for newlines in the current browser/OS combination.
 */
const NEW_LINE_ = userAgent.IS_IE ? '\r\n' : '\n';

/**
 * Whether firing a keypress event causes text to be edited without any
 * additional logic to surgically apply the edit.
 */
const KEYPRESS_EDITS_TEXT_ = userAgent.IS_FIREFOX &&
    !userAgent.isEngineVersion(12);

/**
 * Keyboard state interface
 */
export interface KeyboardState {
    pressed: Key[];
    currentPos: number;
}

/**
 * A keyboard that provides atomic typing actions.
 */
export class Keyboard extends Device {
    private editable_: boolean;
    private currentPos_: number = 0;
    private pressed_: Set<Key> = new Set();

    constructor(opt_state?: KeyboardState, opt_modifiersState?: ModifiersState) {
        super(opt_modifiersState);

        this.editable_ = dom.isEditable(this.getElement());

        if (opt_state) {
            opt_state.pressed.forEach((key) => {
                this.setKeyPressed_(key, true);
            });

            this.currentPos_ = opt_state.currentPos || 0;
        }
    }

    /**
     * Set the modifier state if the provided key is one, otherwise just add
     * to the list of pressed keys.
     */
    private setKeyPressed_(key: Key, isPressed: boolean): void {
        if (MODIFIERS.includes(key) && key.code !== null) {
            const modifier = KEY_TO_MODIFIER_.get(key.code);
            if (modifier !== undefined) {
                this.modifiersState.setPressed(modifier, isPressed);
            }
        }

        if (isPressed) {
            this.pressed_.add(key);
        } else {
            this.pressed_.delete(key);
        }
    }

    /**
     * Returns whether the key is currently pressed.
     */
    isPressed(key: Key): boolean {
        return this.pressed_.has(key);
    }

    /**
     * Presses the given key on the keyboard. Keys that are pressed can be pressed
     * again before releasing, to simulate repeated keys, except for modifier keys,
     * which must be released before they can be pressed again.
     */
    pressKey(key: Key): void {
        if (MODIFIERS.includes(key) && this.isPressed(key)) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot press a modifier key that is already pressed.');
        }

        // Note that GECKO is special-cased below because of
        // https://bugzilla.mozilla.org/show_bug.cgi?id=501496. "preventDefault on
        // keydown does not cancel following keypress"
        const performDefault = key.code !== null &&
            this.fireKeyEvent_(events.EventType.KEYDOWN, key);

        // Fires keydown and stops if unsuccessful.
        if (performDefault || userAgent.IS_FIREFOX) {
            // Fires keypress if required and stops if unsuccessful.
            if (!this.requiresKeyPress_(key) ||
                this.fireKeyEvent_(
                    events.EventType.KEYPRESS, key, !performDefault)) {
                if (performDefault) {
                    this.maybeSubmitForm_(key);
                    if (this.editable_) {
                        this.maybeEditText_(key);
                    }
                }
            }
        }

        this.setKeyPressed_(key, true);
    }

    /**
     * Whether the given key currently requires a keypress.
     */
    private requiresKeyPress_(key: Key): boolean {
        if (key.character || key === Keys.ENTER) {
            return true;
        } else if (userAgent.IS_WEBKIT || userAgent.IS_EDGE) {
            return false;
        } else if (userAgent.IS_IE) {
            return key === Keys.ESC;
        } else { // Gecko
            switch (key) {
                case Keys.SHIFT:
                case Keys.CONTROL:
                case Keys.ALT:
                    return false;
                case Keys.META:
                case Keys.META_RIGHT:
                case Keys.CONTEXT_MENU:
                    return userAgent.IS_FIREFOX;
                default:
                    return true;
            }
        }
    }

    /**
     * Maybe submit a form if the ENTER key is released. On non-FF browsers, firing
     * the keyPress and keyRelease events for the ENTER key does not result in a
     * form being submitted so we have to fire the form submit event as well.
     */
    private maybeSubmitForm_(key: Key): void {
        if (key !== Keys.ENTER) {
            return;
        }
        if ((userAgent.IS_FIREFOX && !userAgent.isEngineVersion(93)) ||
            this.getElement().tagName?.toLowerCase() !== 'input') {
            return;
        }

        const form = Device.findAncestorForm(this.getElement());
        if (form) {
            const inputs = (form as HTMLFormElement).getElementsByTagName('input');
            let hasSubmit = false;
            for (let i = 0; i < inputs.length; i++) {
                if (Device.isFormSubmitElement(inputs[i])) {
                    hasSubmit = true;
                    break;
                }
            }
            // The second part of this if statement will always include forms on Safari
            // version < 5.
            if (hasSubmit || inputs.length === 1 ||
                (userAgent.IS_WEBKIT && !userAgent.isEngineVersion(534))) {
                this.submitForm(form);
            }
        }
    }

    /**
     * Maybe edit text when a key is pressed in an editable form.
     */
    private maybeEditText_(key: Key): void {
        if (key.character) {
            this.updateOnCharacter_(key);
        } else {
            switch (key) {
                case Keys.ENTER:
                    this.updateOnEnter_();
                    break;
                case Keys.BACKSPACE:
                case Keys.DELETE:
                    this.updateOnBackspaceOrDelete_(key);
                    break;
                case Keys.LEFT:
                case Keys.RIGHT:
                    this.updateOnLeftOrRight_(key);
                    break;
                case Keys.HOME:
                case Keys.END:
                    this.updateOnHomeOrEnd_(key);
                    break;
            }
        }
    }

    /**
     * Releases the given key on the keyboard. Releasing a key that is not
     * pressed results in an exception.
     */
    releaseKey(key: Key): void {
        if (!this.isPressed(key)) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Cannot release a key that is not pressed. (' + key.code + ')');
        }
        if (key.code !== null) {
            this.fireKeyEvent_(events.EventType.KEYUP, key);
        }

        this.setKeyPressed_(key, false);
    }

    /**
     * Given the current state of the SHIFT and CAPS_LOCK key, returns the
     * character that will be typed if the specified key is pressed.
     */
    private getChar_(key: Key): string {
        if (!key.character) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR, 'not a character key');
        }
        const shiftPressed = this.isPressed(Keys.SHIFT);
        return shiftPressed ? (key.shiftChar || '') : key.character;
    }

    /**
     * Handle character input
     */
    private updateOnCharacter_(key: Key): void {
        if (KEYPRESS_EDITS_TEXT_) {
            return;
        }

        const character = this.getChar_(key);
        const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
        const currentStart = (element as any).selectionStart || 0;
        const newPos = currentStart + 1;

        if (supportsSelection(element)) {
            setSelectionText(element, character);
            setSelectionStart(element, newPos);
        } else {
            element.value += character;
        }

        if (userAgent.IS_WEBKIT) {
            this.fireHtmlEvent(events.EventType.TEXTINPUT);
        }
        if (!userAgent.IS_IE) {
            this.fireHtmlEvent(events.EventType.INPUT);
        }
        this.updateCurrentPos_(newPos);
    }

    /**
     * Handle ENTER key
     */
    private updateOnEnter_(): void {
        if (KEYPRESS_EDITS_TEXT_) {
            return;
        }

        // WebKit fires text input regardless of whether a new line is added
        if (userAgent.IS_WEBKIT) {
            this.fireHtmlEvent(events.EventType.TEXTINPUT);
        }

        const element = this.getElement();
        if (element.tagName?.toLowerCase() === 'textarea') {
            const textArea = element as HTMLTextAreaElement;
            const currentStart = textArea.selectionStart || 0;
            const newPos = currentStart + NEW_LINE_.length;

            if (supportsSelection(textArea)) {
                setSelectionText(textArea, NEW_LINE_);
                setSelectionStart(textArea, newPos);
            } else {
                textArea.value += NEW_LINE_;
            }

            if (!userAgent.IS_IE) {
                this.fireHtmlEvent(events.EventType.INPUT);
            }
            this.updateCurrentPos_(newPos);
        }
    }

    /**
     * Handle BACKSPACE or DELETE
     */
    private updateOnBackspaceOrDelete_(key: Key): void {
        if (KEYPRESS_EDITS_TEXT_) {
            return;
        }

        const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
        checkCanUpdateSelection_(element);

        const start = (element as any).selectionStart || 0;
        const end = (element as any).selectionEnd || 0;

        if (start === end) {
            if (key === Keys.BACKSPACE) {
                setSelectionStart(element, Math.max(start - 1, 0));
                setSelectionEnd(element, end);
            } else {
                setSelectionEnd(element, Math.min(end + 1, element.value.length));
            }
        }

        const newStart = (element as any).selectionStart || 0;
        const newEnd = (element as any).selectionEnd || 0;
        const textChanged = !(newStart === element.value.length || newEnd === 0);

        setSelectionText(element, '');

        if (!userAgent.IS_IE && textChanged ||
            (userAgent.IS_FIREFOX && key === Keys.BACKSPACE)) {
            this.fireHtmlEvent(events.EventType.INPUT);
        }

        const finalStart = (element as any).selectionStart || 0;
        this.updateCurrentPos_(finalStart);
    }

    /**
     * Handle LEFT or RIGHT arrow
     */
    private updateOnLeftOrRight_(key: Key): void {
        checkCanUpdateSelection_(this.getElement());
        const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
        const start = (element as any).selectionStart || 0;
        const end = (element as any).selectionEnd || 0;

        let newPos: number;
        let startPos = 0;
        let endPos = 0;

        if (key === Keys.LEFT) {
            if (this.isPressed(Keys.SHIFT)) {
                if (this.currentPos_ === start) {
                    startPos = Math.max(start - 1, 0);
                    endPos = end;
                    newPos = startPos;
                } else {
                    startPos = start;
                    endPos = Math.max(end - 1, 0);
                    newPos = endPos;
                }
            } else {
                newPos = start === end ? Math.max(start - 1, 0) : start;
            }
        } else {  // RIGHT
            if (this.isPressed(Keys.SHIFT)) {
                if (this.currentPos_ === end) {
                    startPos = start;
                    endPos = Math.min(end + 1, element.value.length);
                    newPos = endPos;
                } else {
                    startPos = Math.min(start + 1, element.value.length);
                    endPos = end;
                    newPos = startPos;
                }
            } else {
                newPos = start === end ? Math.min(end + 1, element.value.length) : end;
            }
        }

        if (this.isPressed(Keys.SHIFT)) {
            setSelectionStart(element, startPos);
            setSelectionEnd(element, endPos);
        } else {
            setCursorPosition(element, newPos);
        }
        this.updateCurrentPos_(newPos);
    }

    /**
     * Handle HOME or END key
     */
    private updateOnHomeOrEnd_(key: Key): void {
        checkCanUpdateSelection_(this.getElement());
        const element = this.getElement() as HTMLInputElement | HTMLTextAreaElement;
        const start = (element as any).selectionStart || 0;
        const end = (element as any).selectionEnd || 0;

        if (key === Keys.HOME) {
            if (this.isPressed(Keys.SHIFT)) {
                setSelectionStart(element, 0);
                const endPos = this.currentPos_ === start ? end : start;
                setSelectionEnd(element, endPos);
            } else {
                setCursorPosition(element, 0);
            }
            this.updateCurrentPos_(0);
        } else {  // END
            if (this.isPressed(Keys.SHIFT)) {
                if (this.currentPos_ === start) {
                    setSelectionStart(element, end);
                }
                setSelectionEnd(element, element.value.length);
            } else {
                setCursorPosition(element, element.value.length);
            }
            this.updateCurrentPos_(element.value.length);
        }
    }

    /**
     * Update the cursor position
     */
    private updateCurrentPos_(pos: number): void {
        this.currentPos_ = pos;
    }

    /**
     * Fire a keyboard event
     */
    private fireKeyEvent_(type: any, key: Key, opt_preventDefault?: boolean): boolean {
        if (key.code === null) {
            throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
                'Key must have a keycode to be fired.');
        }

        const args: events.KeyboardArgs = {
            altKey: this.isPressed(Keys.ALT),
            ctrlKey: this.isPressed(Keys.CONTROL),
            metaKey: this.isPressed(Keys.META),
            shiftKey: this.isPressed(Keys.SHIFT),
            keyCode: key.code,
            charCode: (key.character && type === events.EventType.KEYPRESS) ?
                this.getChar_(key).charCodeAt(0) : 0,
            preventDefault: !!opt_preventDefault
        };

        return this.fireKeyboardEvent(type, args);
    }

    /**
     * Sets focus to the element. If the element does not have focus, place cursor
     * at the end of the text in the element.
     */
    moveCursor(element: Element): void {
        this.setElement(element);
        this.editable_ = dom.isEditable(element);

        const focusChanged = this.focusOnElement();
        if (this.editable_ && focusChanged) {
            const input = element as HTMLInputElement | HTMLTextAreaElement;
            setCursorPosition(input, input.value.length);
            this.updateCurrentPos_(input.value.length);
        }
    }

    /**
     * Serialize the current state of the keyboard.
     */
    getState(): KeyboardState {
        return {
            pressed: Array.from(this.pressed_),
            currentPos: this.currentPos_
        };
    }

    /**
     * Returns the state of the modifier keys, to be shared with other input
     * devices.
     */
    getModifiersState(): ModifiersState {
        return this.modifiersState;
    }
}

/**
 * Checks that the cursor position can be updated for the given element.
 */
function checkCanUpdateSelection_(element: Element): void {
    try {
        const input = element as HTMLInputElement | HTMLTextAreaElement;
        if (typeof input.selectionStart === 'number') {
            return;
        }
    } catch (ex: any) {
        if (ex.message && ex.message.indexOf('does not support selection.') !== -1) {
            throw Error(ex.message + ' (For more information, see ' +
                'https://code.google.com/p/chromium/issues/detail?id=330456)');
        }
        throw ex;
    }
    throw Error('Element does not support selection');
}

/**
 * Whether the given element supports the input element selection API.
 */
export function supportsSelection(element: Element): boolean {
    try {
        checkCanUpdateSelection_(element);
    } catch (ex) {
        return false;
    }
    return true;
}

/**
 * Helper to get selection start position
 */
function getSelectionStart(element: HTMLInputElement | HTMLTextAreaElement): number {
    return (element as any).selectionStart || 0;
}

/**
 * Helper to set selection start position
 */
function setSelectionStart(element: HTMLInputElement | HTMLTextAreaElement, pos: number): void {
    try {
        (element as any).selectionStart = pos;
    } catch (ex) {
        // Ignore errors
    }
}

/**
 * Helper to get selection end position
 */
function getSelectionEnd(element: HTMLInputElement | HTMLTextAreaElement): number {
    return (element as any).selectionEnd || 0;
}

/**
 * Helper to set selection end position
 */
function setSelectionEnd(element: HTMLInputElement | HTMLTextAreaElement, pos: number): void {
    try {
        (element as any).selectionEnd = pos;
    } catch (ex) {
        // Ignore errors
    }
}

/**
 * Helper to set selection text
 */
function setSelectionText(element: HTMLInputElement | HTMLTextAreaElement, text: string): void {
    try {
        if (typeof (element as any).setRangeText === 'function') {
            (element as any).setRangeText(text);
        } else {
            // Fallback for older browsers
            const start = getSelectionStart(element);
            const end = getSelectionEnd(element);
            const before = element.value.substring(0, start);
            const after = element.value.substring(end);
            element.value = before + text + after;
        }
    } catch (ex) {
        // Ignore errors
    }
}

/**
 * Helper to set cursor position
 */
function setCursorPosition(element: HTMLInputElement | HTMLTextAreaElement, pos: number): void {
    try {
        setSelectionStart(element, pos);
        setSelectionEnd(element, pos);
    } catch (ex) {
        // Ignore errors
    }
}
