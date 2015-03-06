#include "build_environment.h"

#ifdef BUILD_ON_UNIX
#include <dlfcn.h>
#include "imehandler.h"
#endif

#include "library_loading.h"
#include "logging.h"

#ifdef BUILD_ON_UNIX
IMELIB_TYPE tryToOpenImeLib() {
  void* lib = dlopen("libibushandler.so", RTLD_NOW | RTLD_LOCAL | RTLD_NODELETE);
  if (!lib) {
    LOG(DEBUG) << "Cannot load the shared library: " << dlerror();
    return NULL;
  }
  // Reset error.
  dlerror();
  return lib;
}

destroy_h* getDestroyHandler(IMELIB_TYPE lib) {
  destroy_h* destroy_handler = (destroy_h*) dlsym(lib, "destroy");
  const char* dlsym_error = dlerror();
  if (dlsym_error) {
    LOG(DEBUG) <<"Cannot load symbol destroy: " << dlsym_error;
    return NULL;
  }
  return destroy_handler;
}

create_h* getCreateHandler(IMELIB_TYPE lib) {
  create_h* create_handler = (create_h*) dlsym(lib, "create");
  const char* dlsym_error = dlerror();
  if (dlsym_error) {
    LOG(DEBUG) <<"Cannot load symbol create: " << dlsym_error;
    return NULL;
  }
  return create_handler;
}

void tryToCloseImeLib(ImeHandler* handler, IMELIB_TYPE lib) {

  destroy_h* destroy_handler = getDestroyHandler(lib);
  destroy_handler(handler);
  if(dlclose(lib) != 0) {
    LOG(ERROR) << dlerror();
  }
}

#else
IMELIB_TYPE tryToOpenImeLib() {
  IMELIB_TYPE lib = LoadLibrary(L"imehandler.dll");
  if (!lib) {
    LOG(DEBUG) << "Cannot load the shared library: " << GetLastError();
    return NULL;
  }
  return lib;
}

destroy_h* getDestroyHandler(IMELIB_TYPE lib) {
  FARPROC initializer = GetProcAddress(lib, "destroy");
  if(initializer == NULL)
  {
    LOG(DEBUG) <<"Cannot load symbol destroy: " << GetLastError();
    return NULL;
  }
  destroy_h* destroy_handler = (destroy_h*)initializer;
  return destroy_handler;
}

create_h* getCreateHandler(IMELIB_TYPE lib) {
  FARPROC initializer = GetProcAddress(lib, "create");
  if(initializer == NULL) {
    LOG(DEBUG) <<"Cannot load symbol create: " << GetLastError();
    return NULL;
  }
  create_h* create_handler = (create_h*)initializer;
  return create_handler;
}

void tryToCloseImeLib(ImeHandler* handler, IMELIB_TYPE lib) {
  if( FreeLibrary(lib) == 0) {
    LOG(ERROR) << GetLastError();
  }
}

#endif
