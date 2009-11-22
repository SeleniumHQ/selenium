// 
// GTMDefines.h
//
//  Copyright 2008 Google Inc.
//
//  Licensed under the Apache License, Version 2.0 (the "License"); you may not
//  use this file except in compliance with the License.  You may obtain a copy
//  of the License at
// 
//  http://www.apache.org/licenses/LICENSE-2.0
// 
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
//  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
//  License for the specific language governing permissions and limitations under
//  the License.
//
 
// ============================================================================

#include <AvailabilityMacros.h>

// Not all MAC_OS_X_VERSION_10_X macros defined in past SDKs
#ifndef MAC_OS_X_VERSION_10_5
# define MAC_OS_X_VERSION_10_5 1050
#endif
#ifndef MAC_OS_X_VERSION_10_6
# define MAC_OS_X_VERSION_10_6 1060
#endif

// ----------------------------------------------------------------------------
// CPP symbols that can be overridden in a prefix to control how the toolbox
// is compiled.
// ----------------------------------------------------------------------------


// GTMHTTPFetcher will support logging by default but only hook its input
// stream support for logging when requested.  You can control the inclusion of
// the code by providing your own definitions for these w/in a prefix header.
//
#ifndef GTM_HTTPFETCHER_ENABLE_LOGGING
# define GTM_HTTPFETCHER_ENABLE_LOGGING 1
#endif // GTM_HTTPFETCHER_ENABLE_LOGGING
#ifndef GTM_HTTPFETCHER_ENABLE_INPUTSTREAM_LOGGING
# define GTM_HTTPFETCHER_ENABLE_INPUTSTREAM_LOGGING 0
#endif // GTM_HTTPFETCHER_ENABLE_INPUTSTREAM_LOGGING

// By setting the GTM_CONTAINERS_VALIDATION_FAILED_LOG and 
// GTM_CONTAINERS_VALIDATION_FAILED_ASSERT macros you can control what happens
// when a validation fails. If you implement your own validators, you may want
// to control their internals using the same macros for consistency.
#ifndef GTM_CONTAINERS_VALIDATION_FAILED_ASSERT
#define GTM_CONTAINERS_VALIDATION_FAILED_ASSERT 0
#endif

// _GTMDevLog & _GTMDevAssert
//
// _GTMDevLog & _GTMDevAssert are meant to be a very lightweight shell for
// developer level errors.  This implementation simply macros to NSLog/NSAssert.
// It is not intended to be a general logging/reporting system.
//
// Please see http://code.google.com/p/google-toolbox-for-mac/wiki/DevLogNAssert
// for a little more background on the usage of these macros.
//
//    _GTMDevLog           log some error/problem in debug builds
//    _GTMDevAssert        assert if conditon isn't met w/in a method/function
//                           in all builds.
// 
// To replace this system, just provide different macro definitions in your
// prefix header.  Remember, any implementation you provide *must* be thread
// safe since this could be called by anything in what ever situtation it has
// been placed in.
// 

// We only define the simple macros if nothing else has defined this.
#ifndef _GTMDevLog

#ifdef DEBUG
 #define _GTMDevLog(...) NSLog(__VA_ARGS__)
#else
 #define _GTMDevLog(...) do { } while (0)
#endif

#endif // _GTMDevLog

// Declared here so that it can easily be used for logging tracking if
// necessary. See GTMUnitTestDevLog.h for details.
@class NSString;
extern void _GTMUnitTestDevLog(NSString *format, ...);

#ifndef _GTMDevAssert
// we directly invoke the NSAssert handler so we can pass on the varargs
// (NSAssert doesn't have a macro we can use that takes varargs)
#if !defined(NS_BLOCK_ASSERTIONS)
#define _GTMDevAssert(condition, ...)                                    \
  do {                                                                   \
    if (!(condition)) {                                                  \
      [[NSAssertionHandler currentHandler]                               \
          handleFailureInFunction:[NSString stringWithCString:__PRETTY_FUNCTION__] \
                             file:[NSString stringWithCString:__FILE__]  \
                       lineNumber:__LINE__                               \
                      description:__VA_ARGS__];                          \
    }                                                                    \
  } while(0)
#else // !defined(NS_BLOCK_ASSERTIONS)
#define _GTMDevAssert(condition, ...) do { } while (0)
#endif // !defined(NS_BLOCK_ASSERTIONS)

#endif // _GTMDevAssert

// _GTMCompileAssert
// _GTMCompileAssert is an assert that is meant to fire at compile time if you
// want to check things at compile instead of runtime. For example if you
// want to check that a wchar is 4 bytes instead of 2 you would use
// _GTMCompileAssert(sizeof(wchar_t) == 4, wchar_t_is_4_bytes_on_OS_X)
// Note that the second "arg" is not in quotes, and must be a valid processor
// symbol in it's own right (no spaces, punctuation etc).

// Wrapping this in an #ifndef allows external groups to define their own
// compile time assert scheme.
#ifndef _GTMCompileAssert
// We got this technique from here:
// http://unixjunkie.blogspot.com/2007/10/better-compile-time-asserts_29.html

#define _GTMCompileAssertSymbolInner(line, msg) _GTMCOMPILEASSERT ## line ## __ ## msg
#define _GTMCompileAssertSymbol(line, msg) _GTMCompileAssertSymbolInner(line, msg)
#define _GTMCompileAssert(test, msg) \
  typedef char _GTMCompileAssertSymbol(__LINE__, msg) [ ((test) ? 1 : -1) ]
#endif // _GTMCompileAssert

// ============================================================================

// ----------------------------------------------------------------------------
// CPP symbols defined based on the project settings so the GTM code has
// simple things to test against w/o scattering the knowledge of project
// setting through all the code.
// ----------------------------------------------------------------------------

// Provide a single constant CPP symbol that all of GTM uses for ifdefing
// iPhone code.
#include <TargetConditionals.h>
#if TARGET_OS_IPHONE // iPhone SDK
  // For iPhone specific stuff
  #define GTM_IPHONE_SDK 1
  #if TARGET_IPHONE_SIMULATOR
    #define GTM_IPHONE_SIMULATOR 1
  #else
    #define GTM_IPHONE_DEVICE 1
  #endif  // TARGET_IPHONE_SIMULATOR
#else
  // For MacOS specific stuff
  #define GTM_MACOS_SDK 1
#endif

// To simplify support for 64bit (and Leopard in general), we provide the type
// defines for non Leopard SDKs
#if MAC_OS_X_VERSION_MAX_ALLOWED <= MAC_OS_X_VERSION_10_4
 // NSInteger/NSUInteger and Max/Mins
 #ifndef NSINTEGER_DEFINED
  #if __LP64__ || NS_BUILD_32_LIKE_64
   typedef long NSInteger;
   typedef unsigned long NSUInteger;
  #else
   typedef int NSInteger;
   typedef unsigned int NSUInteger;
  #endif
  #define NSIntegerMax    LONG_MAX
  #define NSIntegerMin    LONG_MIN
  #define NSUIntegerMax   ULONG_MAX
  #define NSINTEGER_DEFINED 1
 #endif  // NSINTEGER_DEFINED
 // CGFloat
 #ifndef CGFLOAT_DEFINED
  #if defined(__LP64__) && __LP64__
   // This really is an untested path (64bit on Tiger?)
   typedef double CGFloat;
   #define CGFLOAT_MIN DBL_MIN
   #define CGFLOAT_MAX DBL_MAX
   #define CGFLOAT_IS_DOUBLE 1
  #else /* !defined(__LP64__) || !__LP64__ */
   typedef float CGFloat;
   #define CGFLOAT_MIN FLT_MIN
   #define CGFLOAT_MAX FLT_MAX
   #define CGFLOAT_IS_DOUBLE 0
  #endif /* !defined(__LP64__) || !__LP64__ */
  #define CGFLOAT_DEFINED 1
 #endif // CGFLOAT_DEFINED
#endif  // MAC_OS_X_VERSION_MAX_ALLOWED <= MAC_OS_X_VERSION_10_4


// Give ourselves a consistent way to do inlines.  Apple's macros even use
// a few different actual definitions, so we're based off of the foundation
// one.
#if !defined(GTM_INLINE)
 #if defined (__GNUC__) && (__GNUC__ == 4)
  #define GTM_INLINE static __inline__ __attribute__((always_inline))
 #else
  #define GTM_INLINE static __inline__
 #endif
#endif
