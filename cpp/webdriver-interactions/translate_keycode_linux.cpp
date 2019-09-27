// Auto-generated on Thu Jul 16 15:45:26 2009 , do not hand-edit.

#include <gdk/gdk.h>
#include <gdk/gdkkeysyms.h>
#include "translate_keycode_linux.h"

guint translate_code_to_gdk_symbol(const wchar_t key_code) { 
	guint ret_code = GDK_VoidSymbol;
	if (key_code == L'\uE000') {
		ret_code = GDK_VoidSymbol;
	} else 	if (key_code == L'\uE025') {
		ret_code = GDK_KP_Add;
	} else 	if (key_code == L'\uE016') {
		ret_code = GDK_Insert;
	} else 	if (key_code == L'\uE035') {
		ret_code = GDK_F5;
	} else 	if (key_code == L'\uE03B') {
		ret_code = GDK_F11;
	} else 	if (key_code == L'\uE006') {
		ret_code = GDK_Return;
	} else 	if (key_code == L'\uE027') {
		ret_code = GDK_KP_Subtract;
	} else 	if (key_code == L'\uE010') {
		ret_code = GDK_End;
	} else 	if (key_code == L'\uE004') {
		ret_code = GDK_Tab;
	} else 	if (key_code == L'\uE029') {
		ret_code = GDK_KP_Divide;
	} else 	if (key_code == L'\uE012') {
		ret_code = GDK_Left;
	} else 	if (key_code == L'\uE018') {
		ret_code = GDK_semicolon;
	} else 	if (key_code == L'\uE033') {
		ret_code = GDK_F3;
	} else 	if (key_code == L'\uE01F') {
		ret_code = GDK_KP_5;
	} else 	if (key_code == L'\uE021') {
		ret_code = GDK_KP_7;
	} else 	if (key_code == L'\uE00F') {
		ret_code = GDK_Page_Down;
	} else 	if (key_code == L'\uE031') {
		ret_code = GDK_F1;
	} else 	if (key_code == L'\uE002') {
		ret_code = GDK_Help;
	} else 	if (key_code == L'\uE023') {
		ret_code = GDK_KP_9;
	} else 	if (key_code == L'\uE00D') {
		ret_code = GDK_space;
	} else 	if (key_code == L'\uE014') {
		ret_code = GDK_Right;
	} else 	if (key_code == L'\uE037') {
		ret_code = GDK_F7;
	} else 	if (key_code == L'\uE01B') {
		ret_code = GDK_KP_1;
	} else 	if (key_code == L'\uE01E') {
		ret_code = GDK_KP_4;
	} else 	if (key_code == L'\uE009') {
		ret_code = GDK_Control_L;
	} else 	if (key_code == L'\uE00C') {
		ret_code = GDK_Escape;
	} else 	if (key_code == L'\uE019') {
		ret_code = GDK_equal;
	} else 	if (key_code == L'\uE039') {
		ret_code = GDK_F9;
	} else 	if (key_code == L'\uE017') {
		ret_code = GDK_Delete;
	} else 	if (key_code == L'\uE036') {
		ret_code = GDK_F6;
	} else 	if (key_code == L'\uE03C') {
		ret_code = GDK_F12;
	} else 	if (key_code == L'\uE001') {
		ret_code = GDK_Break;
	} else 	if (key_code == L'\uE026') {
		ret_code = GDK_KP_Separator;
	} else 	if (key_code == L'\uE011') {
		ret_code = GDK_Home;
	} else 	if (key_code == L'\uE034') {
		ret_code = GDK_F4;
	} else 	if (key_code == L'\uE03A') {
		ret_code = GDK_F10;
	} else 	if (key_code == L'\uE007') {
		ret_code = GDK_KP_Enter;
	} else 	if (key_code == L'\uE028') {
		ret_code = GDK_KP_Decimal;
	} else 	if (key_code == L'\uE013') {
		ret_code = GDK_Up;
	} else 	if (key_code == L'\uE005') {
		ret_code = GDK_Clear;
	} else 	if (key_code == L'\uE020') {
		ret_code = GDK_KP_6;
	} else 	if (key_code == L'\uE00A') {
		ret_code = GDK_Alt_L;
	} else 	if (key_code == L'\uE032') {
		ret_code = GDK_F2;
	} else 	if (key_code == L'\uE01A') {
		ret_code = GDK_KP_0;
	} else 	if (key_code == L'\uE022') {
		ret_code = GDK_KP_8;
	} else 	if (key_code == L'\uE015') {
		ret_code = GDK_Down;
	} else 	if (key_code == L'\uE01C') {
		ret_code = GDK_KP_2;
	} else 	if (key_code == L'\uE003') {
		ret_code = GDK_BackSpace;
	} else 	if (key_code == L'\uE024') {
		ret_code = GDK_KP_Multiply;
	} else 	if (key_code == L'\uE00E') {
		ret_code = GDK_Page_Up;
	} else 	if (key_code == L'\uE008') {
		ret_code = GDK_Shift_L;
	} else 	if (key_code == L'\uE00B') {
		ret_code = GDK_Pause;
	} else 	if (key_code == L'\uE01D') {
		ret_code = GDK_KP_3;
	} else 	if (key_code == L'\uE038') {
		ret_code = GDK_F8;
	} else 	if (key_code == L'\uE040') {
	    ret_code = GDK_Zenkaku_Hankaku;
	} else {
		ret_code = GDK_VoidSymbol;
	}
	return ret_code;
}
const wchar_t gNullKey = L'\uE000';
