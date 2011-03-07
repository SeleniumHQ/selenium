#include "build_environment.h"

#ifdef BUILD_ON_UNIX
#define IMELIB_TYPE void*
#else
#define IMELIB_TYPE HMODULE
#endif

#include "imehandler.h"

#ifdef _MSC_VER
#include "stdafx.h"
#endif

// Returns a handler to the loaded shared-library.
IMELIB_TYPE tryToOpenImeLib();

// Returns a handler to the function that creates an ImeHandler instance
create_h* getCreateHandler(IMELIB_TYPE lib);

// Returns a handler to the function that destroys an ImeHandler instance
destroy_h* getDestroyHandler(IMELIB_TYPE lib);

// Disposes of an ImeHandler and closes the associated library.
void tryToCloseImeLib(ImeHandler* handler, IMELIB_TYPE);
