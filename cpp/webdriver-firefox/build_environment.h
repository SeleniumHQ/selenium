#ifndef _BUILD_ENVIRONMENT_H_
#define _BUILD_ENVIRONMENT_H_

#ifdef __GNUC__
#define BUILD_ON_UNIX
// TODO(lukeis) add guard for gecko 27
// I tried a few things and couldn't find an option, mozilla-config.h defines MOZILLA_VERSION
// this file doesn't exist in gecko-17, so if we for whatever reason need to rebuild that version
// this line will need to be removed
#include "mozilla/Char16.h"
#else
#define BUILD_ON_WINDOWS
#endif

#ifdef XP_UNIX
#define BUILD_ON_UNIX
#undef BUILD_ON_WINDOWS
#endif

#ifdef XP_WIN
#define BUILD_ON_WINDOWS
#endif

#endif

