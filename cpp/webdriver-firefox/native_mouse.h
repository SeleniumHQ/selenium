#pragma once

#ifdef _MSC_VER
#include "stdafx.h"
#endif
#include "nsCOMPtr.h"
#include "nsINativeMouse.h"

#include "nsIAccessibleDocumentWrapper.h"

#define MOUSE_CONTRACTID "@openqa.org/nativemouse;1"
#define MOUSE_CLASSNAME "Firefox OS-level mouse events"
#define MOUSE_CID { 0x45db8a1a, 0x7696, 0x430c, { 0x90, 0x98, 0xc0, 0x61, 0x3f, 0x71, 0x02, 0xad } }

class nsNativeMouse : public nsINativeMouse
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEMOUSE

  nsNativeMouse();

private:
  ~nsNativeMouse();

protected:
  /* additional members */
};
