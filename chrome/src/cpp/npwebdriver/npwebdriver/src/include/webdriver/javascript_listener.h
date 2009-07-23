//TODO(danielwh): Break this processing out into Javascript

#ifndef WEBDRIVER_JAVASCRIPT_LISTENER_H_
#define WEBDRIVER_JAVASCRIPT_LISTENER_H_

#include "third_party/npapi/bindings/npruntime.h"
#include "webkit/glue/plugins/nphostapi.h"

namespace webdriver {

class ChromeDriverPlugin;

/**
 * Class to allow us to dynamically dispatch to a listener,
 * rather than all be static
 */
class BaseJavascriptListener : public NPObject {
 public:
  BaseJavascriptListener(NPP instance) : instance_(instance) {}

  static NPObject *Allocate(NPP npp, NPClass *aClass) {
    return new BaseJavascriptListener(npp);
  }
  static void Deallocate(NPObject *npobj) {
    delete (BaseJavascriptListener *)npobj;
  }
  static void Invalidate(NPObject *npobj) {}
  static bool HasMethod(NPObject *npobj, NPIdentifier name) {
    return ((BaseJavascriptListener *)npobj)->HasMethod(name);
  }
  static bool Invoke(NPObject *npobj,
                     NPIdentifier name,
                     const NPVariant *args,
                     uint32_t argCount,
                     NPVariant *result) {
    return ((BaseJavascriptListener *)npobj)->Invoke(name, args, argCount, result);
  }
  static bool InvokeDefault(NPObject *npobj,
                            const NPVariant *args,
                            uint32_t argCount,
                            NPVariant *result) {
    return ((BaseJavascriptListener *)npobj)->InvokeDefault(args, argCount, result);
  }
  static bool HasProperty(NPObject * npobj, NPIdentifier name) {
    return ((BaseJavascriptListener *)npobj)->HasProperty(name);
  }
  static bool GetProperty(NPObject *npobj,
                          NPIdentifier name,
                          NPVariant *result) {
    return ((BaseJavascriptListener *)npobj)->GetProperty(name, result);
  }
  static bool SetProperty(NPObject *npobj,
                          NPIdentifier name,
                          const NPVariant *value) {
    return ((BaseJavascriptListener *)npobj)->SetProperty(name, value);
  }
  static bool RemoveProperty(NPObject *npobj, NPIdentifier name) {
    return ((BaseJavascriptListener *)npobj)->RemoveProperty(name);
  }
  static bool Enumerate(NPObject *npobj, NPIdentifier **identifier,
                         uint32_t *count) {
    return ((BaseJavascriptListener *)npobj)->Enumerate(identifier, count);
  }
  static bool Construct(NPObject *npobj,
                        const NPVariant *args,
                        uint32_t argCount,
                        NPVariant *result) {
    return ((BaseJavascriptListener *)npobj)->Construct(args, argCount,
        result);
  }
                         
  virtual bool HasMethod(NPIdentifier name) {
    return false;
  }
  virtual bool Invoke(NPIdentifier name,
                      const NPVariant *args,
                      uint32_t argCount,
                      NPVariant *result) {
    return false;
  }
  virtual bool InvokeDefault(const NPVariant *args,uint32_t argCount,
                             NPVariant *result) {
    return false;
  }
  virtual bool HasProperty(NPIdentifier name) {
    return false;
  }
  virtual bool GetProperty(NPIdentifier name, NPVariant *result) {
    return false;
  }
  virtual bool SetProperty(NPIdentifier name, const NPVariant *value) {
    return false;
  }
  virtual bool RemoveProperty(NPIdentifier name) {
    return false;
  }
  virtual bool Enumerate(NPIdentifier **identifier, uint32_t *count) {
    return false;
  }
  virtual bool Construct(const NPVariant *args, uint32_t argCount,
                         NPVariant *result) {
    return false;
  }

 private:
  NPP instance_;
}; //class BaseJavascriptListener

/**
 * Listener for javascript commands called on our HTML plugin object
 */
class JavascriptListener : public BaseJavascriptListener {
 public:
  static NPObject *Allocate(NPP npp, NPClass *aClass) {
    return new JavascriptListener(npp);
  }
  
  JavascriptListener(NPP instance);
  virtual bool HasMethod(NPIdentifier name);
  virtual bool Invoke(NPIdentifier name,
                      const NPVariant *args,
                      uint32_t argCount,
                      NPVariant *result);
                      
  void set_chrome_driver_plugin(ChromeDriverPlugin *chrome_driver_plugin);
  void set_browser_funcs(NPNetscapeFuncs *browser_funcs);

private:
  ChromeDriverPlugin *chrome_driver_plugin_;
  NPNetscapeFuncs *browser_funcs_;
}; //class JavascriptListener

/**
 * NPClass from which we construct our JavascriptListener,
 * using NPN_CreateObject
 */
static NPClass JavascriptListener_NPClass = {
  NP_CLASS_STRUCT_VERSION_CTOR,
  JavascriptListener::Allocate,
  BaseJavascriptListener::Deallocate,
  BaseJavascriptListener::Invalidate,
  BaseJavascriptListener::HasMethod,
  BaseJavascriptListener::Invoke,
  BaseJavascriptListener::InvokeDefault,
  BaseJavascriptListener::HasProperty,
  BaseJavascriptListener::GetProperty,
  BaseJavascriptListener::SetProperty,
  BaseJavascriptListener::RemoveProperty,
  BaseJavascriptListener::Enumerate,
  BaseJavascriptListener::Construct
}; //NPClass JavascriptListener_NPClass

} //namespace webdriver

#endif //WEBDRIVER_JAVASCRIPT_LISTENER_H_