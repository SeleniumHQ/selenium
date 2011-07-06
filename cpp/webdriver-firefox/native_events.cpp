#include "build_environment.h"

#ifndef GECKO_19_COMPATIBILITY

#ifndef BUILD_ON_UNIX
#define MOZ_NO_MOZALLOC
#include <mozilla-config.h>
#endif

#include <xpcom-config.h>

#else // Gecko 1.9
#ifdef BUILD_ON_UNIX
#include <xpcom-config.h>
#endif
#endif

#include "errorcodes.h"
#include "interactions.h"
#include "logging.h"
#include "native_events.h"
#include "library_loading.h"

#ifndef GECKO_19_COMPATIBILITY
#include "mozilla/ModuleUtils.h"
#else
#include "nsIGenericFactory.h"
#endif

#include "nsIComponentManager.h"
#include "nsComponentManagerUtils.h"
#include <assert.h>

/* IME */
#include <string>
#include "imehandler.h"

#include "nsISupportsPrimitives.h"
#include "nsArrayUtils.h"

#include <nsStringAPI.h>
#include <algorithm>


#ifdef BUILD_ON_WINDOWS
#define EXPORT __declspec(dllexport)
#define WD_RESULT LRESULT
#define BOOL_TYPE boolean
#else
#define EXPORT
#define WD_RESULT int
#define BOOL_TYPE bool
#endif

NS_IMPL_ISUPPORTS1(nsNativeEvents, nsINativeEvents)

nsNativeEvents::nsNativeEvents()
{
  LOG(DEBUG) << "Starting up";
}

nsNativeEvents::~nsNativeEvents()
{
}

/* void SendKeys (in nsISupports aNode, in wstring value); */
NS_IMETHODIMP nsNativeEvents::SendKeys(nsISupports *aNode,
                                       const PRUnichar *value)
{
        LOG(DEBUG) << "---------- Got to start of callback. aNode: " << aNode
                   << " ----------";
        NS_LossyConvertUTF16toASCII ascii_keys(value);
        LOG(DEBUG) << "Ascii keys: " << ascii_keys.get();
        LOG(DEBUG) << "Ascii string length: " << strlen(ascii_keys.get());
        int i = 0;
        while (value[i] != '\0') {
          LOG(DEBUG) << value[i] << " ";
          i++;
        }

        AccessibleDocumentWrapper doc(aNode);

        WINDOW_HANDLE windowHandle = doc.getWindowHandle();

        if (!windowHandle) {
          LOG(WARN) << "Sorry, window handle is null.";
          return NS_ERROR_NULL_POINTER;
        }

        // Note that it's OK to send wchar_t even though wchar_t is *usually*
        // 32 bit, because this code (and any code that links with it) *MUST*
        // be compiled with -fshort-wchar, so it's actually 16 bit and,
        // incidentally, just like PRUnichar. This, of course, breaks any
        // library function that uses wchar_t.
#ifdef BUILD_ON_UNIX
        assert(sizeof(PRUnichar) == sizeof(wchar_t));
        const wchar_t* valuePtr = (const wchar_t*) value;
#else
        const PRUnichar* valuePtr = value;
#endif
        sendKeys(windowHandle, valuePtr, 0);

        LOG(DEBUG) << "Sent keys sucessfully.";

        return NS_OK;
}

/* void mouseMove (in nsISupports aNode, in long startX, in long startY, in long endX, in long endY); */
NS_IMETHODIMP nsNativeEvents::MouseMove(nsISupports *aNode, PRInt32 startX, PRInt32 startY, PRInt32 endX, PRInt32 endY)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();

  if (!windowHandle) {
    return NS_ERROR_NULL_POINTER;
  }

  WD_RESULT res = mouseMoveTo(windowHandle, 100, startX, startY, endX, endY);

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}

/* void click (in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::Click(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have click window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling clickAt: " << x << ", " << y;
  WD_RESULT res = clickAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}


/* void mousePress(in nsISupports aNode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::MousePress(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have mousePress window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling mouseDownAt at: " << x << ", " << y << " with button: " << button;
  WD_RESULT res = mouseDownAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}


/* void mouseRelease(in nsISupports anode, in long x, in long y, in long button); */
NS_IMETHODIMP nsNativeEvents::MouseRelease(nsISupports *aNode, PRInt32 x, PRInt32 y, PRInt32 button)
{
  AccessibleDocumentWrapper doc(aNode);

  void* windowHandle = doc.getWindowHandle();
  LOG(DEBUG) << "Have mouseRelease window handle: " << windowHandle;

  if (!windowHandle) {
    LOG(WARN) << "No window handle!";
    return NS_ERROR_NULL_POINTER;
  }

  LOG(DEBUG) << "Calling mouseUpAt: " << x << ", " << y << " with button: " << button;
  WD_RESULT res = mouseUpAt(windowHandle, x, y, button);

  LOG(DEBUG) << "Result was: " << (res == SUCCESS ? "ok" : "fail");

  return res == SUCCESS ? NS_OK : NS_ERROR_FAILURE;
}


/* void hasUnhandledEvents (in nsISupports aNode, out boolean hasEvents); */
NS_IMETHODIMP nsNativeEvents::HasUnhandledEvents(nsISupports *aNode, PRBool *hasEvents)
{
  *hasEvents = pending_input_events();
  return NS_OK;
}

/* void imeIsActivated (out boolean isActive); */
NS_IMETHODIMP nsNativeEvents::ImeIsActivated(PRBool *isActive)
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
NS_IMETHODIMP nsNativeEvents::ImeGetActiveEngine(nsAString &activeEngine)
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
NS_IMETHODIMP nsNativeEvents::ImeDeactivate()
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
NS_IMETHODIMP nsNativeEvents::ImeActivateEngine(const char *engine, PRBool *activationSucceeded)
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
NS_IMETHODIMP nsNativeEvents::ImeGetAvailableEngines(nsIArray **enginesList)
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

NS_GENERIC_FACTORY_CONSTRUCTOR(nsNativeEvents)

// Common case - build for Gecko SDK 2 and up
#ifndef GECKO_19_COMPATIBILITY

NS_DEFINE_NAMED_CID(EVENTS_CID);

static const mozilla::Module::CIDEntry kNativeEventsCIDs[] = {
  { &kEVENTS_CID, false, NULL, nsNativeEventsConstructor },
  { NULL }
};

static const mozilla::Module::ContractIDEntry kNativeEventsContracts[] = {
  { EVENTS_CONTRACTID, &kEVENTS_CID },
  { NULL }
};

static const mozilla::Module kNativeEventsModule = {
  mozilla::Module::kVersion,
  kNativeEventsCIDs,
  kNativeEventsContracts,
  NULL
};

NSMODULE_DEFN(nsNativeEvents) = &kNativeEventsModule;

NS_IMPL_MOZILLA192_NSGETMODULE(&kNativeEventsModule)

#else
// Gecko 1.9

static nsModuleComponentInfo components[] =
{
  {
    EVENTS_CLASSNAME, 
    EVENTS_CID,
    EVENTS_CONTRACTID,
    nsNativeEventsConstructor,
  }
};

NS_IMPL_NSGETMODULE("NativeEventsModule", components) 
#endif
