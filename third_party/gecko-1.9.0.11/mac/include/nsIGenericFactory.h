/* -*- Mode: C++; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Benjamin Smedberg <benjamin@smedbergs.us>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

#ifndef nsIGenericFactory_h___
#define nsIGenericFactory_h___

#include "nsIFactory.h"
#include "nsIModule.h"
#include "nsIClassInfo.h"

class nsIFile;
class nsIComponentManager;

// {3bc97f01-ccdf-11d2-bab8-b548654461fc}
#define NS_GENERICFACTORY_CID                                                 \
  { 0x3bc97f01, 0xccdf, 0x11d2,                                               \
    { 0xba, 0xb8, 0xb5, 0x48, 0x65, 0x44, 0x61, 0xfc } }

// {3bc97f00-ccdf-11d2-bab8-b548654461fc}
#define NS_IGENERICFACTORY_IID                                                \
  { 0x3bc97f00, 0xccdf, 0x11d2,                                               \
    { 0xba, 0xb8, 0xb5, 0x48, 0x65, 0x44, 0x61, 0xfc } }

#define NS_GENERICFACTORY_CONTRACTID "@mozilla.org/generic-factory;1"
#define NS_GENERICFACTORY_CLASSNAME "Generic Factory"

struct nsModuleComponentInfo; // forward declaration

/**
 * Provides a Generic nsIFactory implementation that can be used by
 * DLLs with very simple factory needs.
 */
class nsIGenericFactory : public nsIFactory {
public:
    NS_DECLARE_STATIC_IID_ACCESSOR(NS_IGENERICFACTORY_IID)
    
    NS_IMETHOD SetComponentInfo(const nsModuleComponentInfo *info) = 0;
    NS_IMETHOD GetComponentInfo(const nsModuleComponentInfo **infop) = 0;
};

NS_DEFINE_STATIC_IID_ACCESSOR(nsIGenericFactory, NS_IGENERICFACTORY_IID)

#ifndef XPCOM_GLUE_AVOID_NSPR
NS_COM_GLUE nsresult
NS_NewGenericFactory(nsIGenericFactory **result,
                     const nsModuleComponentInfo *info);
#endif


/** Component Callbacks **/

 /** 
  * NSConstructorProcPtr
  *
  * This function will be used by the generic factory to create an 
  * instance of the given CID.
  *
  * @param aOuter    : Pointer to a component that wishes to be aggregated
  *                    in the resulting instance. This will be nsnull if no
  *                    aggregation is requested.
  * @param iid       : The IID of the interface being requested in
  *                    the component which is being currently created.
  * @param result    : [out] Pointer to the newly created instance, if successful.
  *
  * @return NS_OK                     Component successfully created and the interface 
  *                                   being requested was successfully returned in result.
  *         NS_NOINTERFACE            Interface not accessible.
  *         NS_ERROR_NO_AGGREGATION   if an 'outer' object is supplied, but the
  *                                   component is not aggregatable.
  *         NS_ERROR*                 Method failure.
  **/
typedef NS_CALLBACK(NSConstructorProcPtr)(nsISupports *aOuter, 
                                          REFNSIID aIID,
                                          void **aResult);

/**
 * NSRegisterSelfProcPtr
 *
 * One time registration call back.  Allows you to perform registration 
 * specific activity like adding yourself to a category.
 *
 * @param aCompMgr    : The global component manager
 * @param aFile       : Component File. This file must have an associated 
 *                      loader and export the required symbols which this 
 *                      loader defines.
 * @param aLoaderStr  : Opaque loader specific string.  This value is
 *                      passed into the nsIModule's registerSelf
 *                      callback and must be fowarded unmodified when
 *                      registering factories via their location.
 * @param aType       : Component Type of CID aClass.  This value is
 *                      passed into the nsIModule's registerSelf
 *                      callback and must be fowarded unmodified when
 *                      registering factories via their location.
 * @param aInfo       : Pointer to array of nsModuleComponentInfo 
 *
 * @param aInfo         
 * @return NS_OK        Registration was successful.
 *         NS_ERROR*    Method failure.
 **/
typedef NS_CALLBACK(NSRegisterSelfProcPtr)(nsIComponentManager *aCompMgr,
                                           nsIFile *aPath,
                                           const char *aLoaderStr,
                                           const char *aType,
                                           const nsModuleComponentInfo *aInfo);

/**
 * NSUnregisterSelfProcPtr
 *
 * One time unregistration call back.  Allows you to perform unregistration
 * specific activity like removing yourself from a category.
 *
 * @param aCompMgr    : The global component manager
 * @param aFile       : Component File. This file must have an associated 
 *                      loader and export the required symbols which this 
 *                      loader defines.
 * @param aLoaderStr  : Opaque loader specific string.  This value is
 *                      passed into the nsIModule's registerSelf
 *                      callback and must be fowarded unmodified when
 *                      registering factories via their location
 * @param aInfo       : Pointer to array of nsModuleComponentInfo 
 *
 * @param aInfo         
 * @return NS_OK        Registration was successful.
 *         NS_ERROR*    Method failure.

 **/
typedef NS_CALLBACK(NSUnregisterSelfProcPtr)(nsIComponentManager *aCompMgr,
                                             nsIFile *aPath,
                                             const char *aLoaderStr,
                                             const nsModuleComponentInfo *aInfo);

/** 
 * NSFactoryDestructorProcPtr
 *
 * This function will be called when the factory is being destroyed. 
 *
 **/ 
typedef NS_CALLBACK(NSFactoryDestructorProcPtr)(void);


/** 
 * NSGetInterfacesProcPtr
 *
 * This function is used to implement class info.
 *       
 * Get an ordered list of the interface ids that instances of the class 
 * promise to implement. Note that nsISupports is an implicit member 
 * of any such list and need not be included. 
 *
 * Should set *count = 0 and *array = null and return NS_OK if getting the 
 * list is not supported.
 * 
 * @see nsIClassInfo.idl
 **/
typedef NS_CALLBACK(NSGetInterfacesProcPtr)(PRUint32 *countp,
                                            nsIID* **array);

/** 
 * NSGetLanguageHelperProcPtr
 *      
 * This function is used to implement class info.
 *
 * Get a language mapping specific helper object that may assist in using
 * objects of this class in a specific lanaguage. For instance, if asked
 * for the helper for nsIProgrammingLanguage::JAVASCRIPT this might return 
 * an object that can be QI'd into the nsIXPCScriptable interface to assist 
 * XPConnect in supplying JavaScript specific behavior to callers of the 
 * instance object.
 *
 * @see: nsIClassInfo.idl, nsIProgrammingLanguage.idl
 *
 * Should return null if no helper available for given language.
 **/
typedef NS_CALLBACK(NSGetLanguageHelperProcPtr)(PRUint32 language,
                                                nsISupports **helper);

/**
 * nsModuleComponentInfo
 *
 * Use this type to define a list of module component info to pass to 
 * NS_NewGenericModule. 
 *
 * @param mDescription           : Class Name of given object
 * @param mCID                   : CID of given object
 * @param mContractID            : Contract ID of given object
 * @param mConstructor           : Constructor of given object
 * @param mRegisterSelfProc      : (optional) Registration Callback
 * @param mUnregisterSelfProc    : (optional) Unregistration Callback
 * @param mFactoryDestructor     : (optional) Destruction Callback
 * @param mGetInterfacesProc     : (optional) Interfaces Callback
 * @param mGetLanguageHelperProc : (optional) Language Helper Callback
 * @param mClassInfoGlobal       : (optional) Global Class Info of given object 
 * @param mFlags                 : (optional) Class Info Flags @see nsIClassInfo 
 *                                 
 * E.g.:
 *     static nsModuleComponentInfo components[] = { ... };
 *
 * See xpcom/sample/nsSampleModule.cpp for more info.
 */
struct nsModuleComponentInfo {
    const char*                                 mDescription;
    nsCID                                       mCID;
    const char*                                 mContractID;
    NSConstructorProcPtr                        mConstructor;
    NSRegisterSelfProcPtr                       mRegisterSelfProc;
    NSUnregisterSelfProcPtr                     mUnregisterSelfProc;
    NSFactoryDestructorProcPtr                  mFactoryDestructor;
    NSGetInterfacesProcPtr                      mGetInterfacesProc;
    NSGetLanguageHelperProcPtr                  mGetLanguageHelperProc;
    nsIClassInfo **                             mClassInfoGlobal;
    PRUint32                                    mFlags;
};


/** Module Callbacks **/


/** 
 * nsModuleConstructorProc
 *      
 * This function is called when the module is first being constructed.
 * @param self module which is being constructed.
 * 
 * @return NS_OK        Construction successful.
 *         NS_ERROR*    Method failure which will result in module not being 
 *                      loaded. 
 **/
typedef nsresult (PR_CALLBACK *nsModuleConstructorProc) (nsIModule *self);


/** 
 * nsModuleDestructorProc
 *      
 * This function is called when the module is being destroyed.
 * @param self module which is being destroyed.
 * 
 **/
typedef void (PR_CALLBACK *nsModuleDestructorProc) (nsIModule *self);

/**
 * nsModuleInfo
 *
 * Use this structure to define meta-information about the module
 * itself, including the name, its components, and an optional
 * module-level initialization or shutdown routine.
 *
 * @param mVersion     : Module Info Version
 * @param mModuleName  : Module Name
 * @param mComponents  : Array of Components
 * @param mCount       : Count of mComponents
 * @param mCtor        : Module user defined constructor
 * @param mDtor        : Module user defined destructor
 *
 **/

struct nsModuleInfo {
    PRUint32                mVersion;
    const char*             mModuleName;
    const nsModuleComponentInfo *mComponents;
    PRUint32                mCount;
    nsModuleConstructorProc mCtor;
    nsModuleDestructorProc  mDtor;
};

/**
 * Rev this if you change the nsModuleInfo, and are worried about
 * binary compatibility. (Ostensibly fix NS_NewGenericModule2() to deal
 * with older rev's at the same time.)
 */
#define NS_MODULEINFO_VERSION 0x00015000UL // 1.5

#ifndef XPCOM_GLUE_AVOID_NSPR
/**
 * Create a new generic module. Use the NS_IMPL_NSGETMODULE macro, or
 * one of its relatives, rather than using this directly.
 */
NS_COM_GLUE nsresult
NS_NewGenericModule2(nsModuleInfo const *info, nsIModule* *result);

/**
 * Obsolete. Use NS_NewGenericModule2() instead.
 */
NS_COM_GLUE nsresult
NS_NewGenericModule(const char* moduleName,
                    PRUint32 componentCount,
                    nsModuleComponentInfo* components,
                    nsModuleDestructorProc dtor,
                    nsIModule* *result);

#endif // XPCOM_GLUE_AVOID_NSPR

#if defined(XPCOM_TRANSLATE_NSGM_ENTRY_POINT)
#  define NSGETMODULE_ENTRY_POINT(_name)  NS_VISIBILITY_HIDDEN nsresult _name##_NSGetModule
#else
#  define NSGETMODULE_ENTRY_POINT(_name)  extern "C" NS_EXPORT nsresult NSGetModule
#endif

/** 
 * Ease of use Macros which define NSGetModule for your component. 
 * See xpcom/sample/nsSampleModule.cpp for more info.
 *
 **/

#define NS_IMPL_NSGETMODULE(_name, _components)                               \
    NS_IMPL_NSGETMODULE_WITH_CTOR_DTOR(_name, _components, nsnull, nsnull)

#define NS_IMPL_NSGETMODULE_WITH_CTOR(_name, _components, _ctor)              \
    NS_IMPL_NSGETMODULE_WITH_CTOR_DTOR(_name, _components, _ctor, nsnull)

#define NS_IMPL_NSGETMODULE_WITH_DTOR(_name, _components, _dtor)              \
    NS_IMPL_NSGETMODULE_WITH_CTOR_DTOR(_name, _components, nsnull, _dtor)

#define NS_IMPL_NSGETMODULE_WITH_CTOR_DTOR(_name, _components, _ctor, _dtor)  \
static nsModuleInfo const kModuleInfo = {                                     \
    NS_MODULEINFO_VERSION,                                                    \
    (#_name),                                                                 \
    (_components),                                                            \
    (sizeof(_components) / sizeof(_components[0])),                           \
    (_ctor),                                                                  \
    (_dtor)                                                                   \
};                                                                            \
NSGETMODULE_ENTRY_POINT(_name)                                                \
(nsIComponentManager *servMgr,                                                \
            nsIFile* location,                                                \
            nsIModule** result)                                               \
{                                                                             \
    return NS_NewGenericModule2(&kModuleInfo, result);                        \
}

////////////////////////////////////////////////////////////////////////////////

#define NS_GENERIC_FACTORY_CONSTRUCTOR(_InstanceClass)                        \
static NS_IMETHODIMP                                                          \
_InstanceClass##Constructor(nsISupports *aOuter, REFNSIID aIID,               \
                            void **aResult)                                   \
{                                                                             \
    nsresult rv;                                                              \
                                                                              \
    _InstanceClass * inst;                                                    \
                                                                              \
    *aResult = NULL;                                                          \
    if (NULL != aOuter) {                                                     \
        rv = NS_ERROR_NO_AGGREGATION;                                         \
        return rv;                                                            \
    }                                                                         \
                                                                              \
    NS_NEWXPCOM(inst, _InstanceClass);                                        \
    if (NULL == inst) {                                                       \
        rv = NS_ERROR_OUT_OF_MEMORY;                                          \
        return rv;                                                            \
    }                                                                         \
    NS_ADDREF(inst);                                                          \
    rv = inst->QueryInterface(aIID, aResult);                                 \
    NS_RELEASE(inst);                                                         \
                                                                              \
    return rv;                                                                \
}                                                                             \


#define NS_GENERIC_FACTORY_CONSTRUCTOR_INIT(_InstanceClass, _InitMethod)      \
static NS_IMETHODIMP                                                          \
_InstanceClass##Constructor(nsISupports *aOuter, REFNSIID aIID,               \
                            void **aResult)                                   \
{                                                                             \
    nsresult rv;                                                              \
                                                                              \
    _InstanceClass * inst;                                                    \
                                                                              \
    *aResult = NULL;                                                          \
    if (NULL != aOuter) {                                                     \
        rv = NS_ERROR_NO_AGGREGATION;                                         \
        return rv;                                                            \
    }                                                                         \
                                                                              \
    NS_NEWXPCOM(inst, _InstanceClass);                                        \
    if (NULL == inst) {                                                       \
        rv = NS_ERROR_OUT_OF_MEMORY;                                          \
        return rv;                                                            \
    }                                                                         \
    NS_ADDREF(inst);                                                          \
    rv = inst->_InitMethod();                                                 \
    if(NS_SUCCEEDED(rv)) {                                                    \
        rv = inst->QueryInterface(aIID, aResult);                             \
    }                                                                         \
    NS_RELEASE(inst);                                                         \
                                                                              \
    return rv;                                                                \
}                                                                             \

// 'Constructor' that uses an existing getter function that gets a singleton.
// NOTE: assumes that getter does an AddRef - so additional AddRef is not done.
#define NS_GENERIC_FACTORY_SINGLETON_CONSTRUCTOR(_InstanceClass, _GetterProc) \
static NS_IMETHODIMP                                                          \
_InstanceClass##Constructor(nsISupports *aOuter, REFNSIID aIID,               \
                            void **aResult)                                   \
{                                                                             \
    nsresult rv;                                                              \
                                                                              \
    _InstanceClass * inst;                                                    \
                                                                              \
    *aResult = NULL;                                                          \
    if (NULL != aOuter) {                                                     \
        rv = NS_ERROR_NO_AGGREGATION;                                         \
        return rv;                                                            \
    }                                                                         \
                                                                              \
    inst = _GetterProc();                                                     \
    if (NULL == inst) {                                                       \
        rv = NS_ERROR_OUT_OF_MEMORY;                                          \
        return rv;                                                            \
    }                                                                         \
    /* NS_ADDREF(inst); */                                                    \
    rv = inst->QueryInterface(aIID, aResult);                                 \
    NS_RELEASE(inst);                                                         \
                                                                              \
    return rv;                                                                \
}                                                                             \

#endif /* nsIGenericFactory_h___ */
