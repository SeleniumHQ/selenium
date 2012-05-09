#include "build_environment.h"

#ifndef GECKO_19_COMPATIBILITY

#ifndef BUILD_ON_UNIX
#define MOZ_NO_MOZALLOC
#include <mozilla-config.h>
#endif

#include <xpcom-config.h>
#undef HAVE_CPP_CHAR16_T

#else // Gecko 1.9
#ifdef BUILD_ON_UNIX
#include <xpcom-config.h>
#endif
#endif

#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_ime.h"
#include "library_loading.h"

#ifndef GECKO_19_COMPATIBILITY
#include "mozilla/ModuleUtils.h"
#else
#include "nsIGenericFactory.h"
#endif

#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

#include "nsISupportsPrimitives.h"

#ifdef BUILD_ON_WINDOWS
#define WD_RESULT LRESULT
#else
#define WD_RESULT int
#endif

/* IME */
#include <string>
#include "imehandler.h"

#include "nsISupportsPrimitives.h"
#include "nsArrayUtils.h"

#include <nsStringAPI.h>
#include <algorithm>

NS_IMPL_ISUPPORTS1(nsNativeIME, nsINativeIME)

nsNativeIME::nsNativeIME()
{
  LOG(DEBUG) << "Native IME instantiated.";
}

nsNativeIME::~nsNativeIME()
{
}

/* void imeIsActivated (out boolean isActive); */
NS_IMETHODIMP nsNativeIME::ImeIsActivated(PRBool *isActive)
{
  LOG(DEBUG) << "Getting if IME is active or not";

  IMELIB_TYPE lib = tryToOpenImeLib();
  if (lib)
  {
    create_h* create_handler = getCreateHandler(lib);
    ImeHandler* handler = create_handler();
    *isActive = handler->IsActivated();

    tryToCloseImeLib(handler, lib);
    LOG(DEBUG) << "All done. value: " << *isActive;
    return NS_OK;
  }
  return NS_ERROR_FAILURE;
}

/* void imeGetActiveEngine (out string activeEngine); */
NS_IMETHODIMP nsNativeIME::ImeGetActiveEngine(nsAString &activeEngine)
{
  LOG(DEBUG) << "Getting active engine";
  IMELIB_TYPE lib = tryToOpenImeLib();
  if (lib)
  {
    create_h* create_handler = getCreateHandler(lib);
    ImeHandler* handler = create_handler();
    std::string engine = handler->GetActiveEngine();
    LOG(DEBUG) << "Active engine:" << engine;
    std::wstring wengine(engine.begin(), engine.end());
    // We know that PRUnichar* is wchar_t*. see comment in sendKeys
    activeEngine.Assign((const PRUnichar*) wengine.c_str(), wengine.length());
    tryToCloseImeLib(handler, lib);
    return NS_OK;
  }
  return NS_ERROR_FAILURE;
}

/* void imeDeactivate (); */
NS_IMETHODIMP nsNativeIME::ImeDeactivate()
{
  LOG(DEBUG) << "Deactivating IME";
  IMELIB_TYPE lib = tryToOpenImeLib();
  if (lib)
  {
    create_h* create_handler = getCreateHandler(lib);
    ImeHandler* handler = create_handler();
    handler->Deactivate();
    tryToCloseImeLib(handler, lib);
    return NS_OK;
  }
  return NS_ERROR_FAILURE;
}

/* void imeActivateEngine (in string engine, out boolean activationSucceeded); */
NS_IMETHODIMP nsNativeIME::ImeActivateEngine(const char *engine, PRBool *activationSucceeded)
{
  LOG(DEBUG) << "Activating IME engine " << engine;
  IMELIB_TYPE lib = tryToOpenImeLib();

  if (lib == NULL) {
    return NS_ERROR_FAILURE;
  }

  create_h* create_handler = getCreateHandler(lib);
  ImeHandler* handler = create_handler();

  // 1. Make sure the requested engine is in the list of installed engines.
  std::string engine_name(engine);
  std::vector<std::string> engines = handler->GetAvailableEngines();
  if (std::find(engines.begin(), engines.end(), engine_name) == engines.end()) {
    // Not found
    
    LOG(DEBUG) << "Engine not installed.";
    *activationSucceeded = false;
    tryToCloseImeLib(handler, lib);
    return NS_OK;
  }

  // 2. If the engine is available but not loaded, load it.
  std::vector<std::string> loaded_engines = handler->GetInstalledEngines();
  if (std::find(loaded_engines.begin(), loaded_engines.end(), engine_name) ==
    loaded_engines.end()) {
    LOG(DEBUG) << "Engine not loaded, loading.";

    // Append the engine to the list of loaded engines - not to override
    // the engines already in use by the user.
    int currently_loaded = loaded_engines.size();
    loaded_engines.push_back(engine_name);

    int newly_loaded = handler->LoadEngines(loaded_engines);
    LOG(DEBUG) << "Number of engines loaded:" << newly_loaded;

    // Make sure that the engine was loaded by comparing the number of engines
    // now loaded to the number of engines loaded before the LoadEngine call.  
    if (currently_loaded + 1 != newly_loaded) {
      LOG(DEBUG) << "Engine is installed but could not be loaded.";
      *activationSucceeded = false;
      tryToCloseImeLib(handler, lib);
      return NS_OK;
    }

    // Wait for ibus to register the engine. Without the sleep statement here,
    // the call to ActivateEngine will fail. This is only needed on Linux.
#ifdef BUILD_ON_UNIX
    sleep(1);
#endif
  } else {
    LOG(DEBUG) << "Engine already loaded, not calling LoadEngines again.";
  }

  // 3. Finally, call ActivateEngine to immediately make this engine active.
  *activationSucceeded = handler->ActivateEngine(engine);

  LOG(DEBUG) << "Activation result: " << *activationSucceeded << " isActive: "
    << handler->IsActivated();
  tryToCloseImeLib(handler, lib);
  return NS_OK;
  
}


/*
 * Fill a scriptable array with the values from a vector of strings.
 * The scriptable array can only contain scriptable elements so a
 * nsISupportsCString is created for each std::string in the vector.
*/
static void fillIMutableArrayFromVector(std::vector<std::string> &engines,
    nsCOMPtr<nsIMutableArray> &outArray)
{
  for(std::vector<std::string>::const_iterator it = engines.begin() ; it != engines.end() ; it++)
  {
    LOG(DEBUG) << "Outputting engine : "  << *it;
    
    std::string engine(it->begin(), it->end());
    nsCString new_data;
    new_data.Assign(engine.c_str(), engine.length());

    nsCOMPtr<nsISupportsCString> curr_engine = do_CreateInstance(NS_SUPPORTS_CSTRING_CONTRACTID);
    curr_engine->SetData(new_data);

    outArray->AppendElement(curr_engine, false /* STRONG reference. */);
  }
}

/* void imeGetAvailableEngines (out AString enginesList); */
NS_IMETHODIMP nsNativeIME::ImeGetAvailableEngines(nsIArray **enginesList)
{
  NS_ENSURE_ARG_POINTER(enginesList);
  *enginesList = nsnull;

  LOG(DEBUG) << "getting available engines";

  IMELIB_TYPE lib = tryToOpenImeLib();
  if (lib)
  {
    create_h* create_handler = getCreateHandler(lib);
    ImeHandler* handler = create_handler();
    std::vector<std::string> engines = handler->GetAvailableEngines();
    LOG(DEBUG) << "Number of engines received: " << engines.size();

    nsCOMPtr<nsIMutableArray> returnArray = do_CreateInstance(NS_ARRAY_CONTRACTID);
    NS_ENSURE_TRUE(returnArray, NS_ERROR_FAILURE);
    fillIMutableArrayFromVector(engines, returnArray);

    NS_ADDREF(*enginesList = returnArray);
    tryToCloseImeLib(handler, lib);

    LOG(DEBUG) << "Done getAvailableEngines.";
        
    return NS_OK;
  }
  return NS_ERROR_FAILURE;
}

