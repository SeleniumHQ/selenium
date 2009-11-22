#pragma once

#ifdef _MSC_VER
#include "stdafx.h"
#endif
#include "nsCOMPtr.h"
#include "nsINativeEvents.h"

#include "nsIAccessibleDocumentWrapper.h"

#define EVENTS_CONTRACTID "@openqa.org/nativeevents;1"
#define EVENTS_CLASSNAME "Firefox OS-level events"
#define EVENTS_CID { 0xaa54e938, 0x2752, 0x4194, { 0x80, 0xa6, 0x4d, 0x32, 0x58, 0x5b, 0x50, 0xee } }


class nsNativeEvents : public nsINativeEvents
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_NSINATIVEEVENTS

  nsNativeEvents();

private:
  ~nsNativeEvents();

protected:
  /* additional members */
};
