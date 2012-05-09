#pragma once

#ifdef _MSC_VER
#include "stdafx.h"
#endif
#include "nsCOMPtr.h"
#include "nsINativeIME.h"

#include "nsIAccessibleDocumentWrapper.h"

#define IME_CONTRACTID "@openqa.org/nativeime;1"
#define IME_CLASSNAME "Firefox OS-level Input Method Editor events"
#define IME_CID { 0xad200211,  0x0e76,  0x4612,  { 0x9c,  0x88,  0x70,  0x86,  0x8c,  0x87,  0xcf,  0xfd } }

class nsNativeIME : public nsINativeIME
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEIME

  nsNativeIME();

private:
  ~nsNativeIME();

protected:
  /* additional members */
};
