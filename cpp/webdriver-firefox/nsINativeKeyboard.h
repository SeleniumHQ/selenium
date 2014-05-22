#ifdef GECKO_100_COMPATIBILITY
#include "nsINativeKeyboard_g10.h"
#else
#ifdef WEBDRIVER_LEGACY_GECKO
#include "nsINativeKeyboard_g16.h"
#else
#include "nsINativeKeyboard_g29.h"
#endif
#endif
