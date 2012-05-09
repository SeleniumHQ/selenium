#pragma once

#ifdef _MSC_VER
#include "stdafx.h"
#endif
#include "nsCOMPtr.h"
#include "nsINativeKeyboard.h"

#include "nsIAccessibleDocumentWrapper.h"

#define KEYBOARD_CONTRACTID "@openqa.org/nativekeyboard;1"
#define KEYBOARD_CLASSNAME "Firefox OS-level keyboard events"
#define KEYBOARD_CID {0xd687dece, 0x76c7, 0x4aaf, { 0x92, 0x79, 0x2c, 0xc1, 0x23, 0xf1, 0x31, 0xd9} }

class nsNativeKeyboard : public nsINativeKeyboard
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEKEYBOARD

  nsNativeKeyboard();

private:
  ~nsNativeKeyboard();

protected:
  /* additional members */
};
