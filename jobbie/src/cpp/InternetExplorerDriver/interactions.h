#ifndef interactions_h
#define interactions_h

#include <wchar.h>

#define EXPORT __declspec(dllexport)

#ifdef __cplusplus
extern "C" {
#endif

// Keyboard interactions
EXPORT boolean sendKeysToFileAlert(HWND alertHwnd, const wchar_t* value);
EXPORT void sendKeys(HWND directInputTo, const wchar_t* value, int timePerKey);

// Mouse interactions
EXPORT void clickAt(HWND directInputTo, long x, long y);
EXPORT void mouseDownAt(HWND directInputTo, long x, long y);
EXPORT void mouseUpAt(HWND directInputTo, long x, long y);

#ifdef __cplusplus
}
#endif
#endif
