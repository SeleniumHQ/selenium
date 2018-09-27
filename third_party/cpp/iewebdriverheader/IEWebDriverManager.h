

/* this ALWAYS GENERATED file contains the definitions for the interfaces */


 /* File created by MIDL compiler version 7.00.0555 */
/* at Thu Sep 04 05:00:00 2014
 */
/* Compiler settings for IEWebDriver.idl:
    Oicf, W1, Zp8, env=Win32 (32b run), target_arch=X86 7.00.0555 
    protocol : dce , ms_ext, c_ext, robust
    error checks: allocation ref bounds_check enum stub_data 
    VC __declspec() decoration level: 
         __declspec(uuid()), __declspec(selectany), __declspec(novtable)
         DECLSPEC_UUID(), MIDL_INTERFACE()
*/
/* @@MIDL_FILE_HEADING(  ) */

#pragma warning( disable: 4049 )  /* more than 64k source lines */


/* verify that the <rpcndr.h> version is high enough to compile this file*/
#ifndef __REQUIRED_RPCNDR_H_VERSION__
#define __REQUIRED_RPCNDR_H_VERSION__ 475
#endif

#include "rpc.h"
#include "rpcndr.h"

#ifndef __RPCNDR_H_VERSION__
#error this stub requires an updated version of <rpcndr.h>
#endif // __RPCNDR_H_VERSION__


#ifndef __IEWebDriverManager_h__
#define __IEWebDriverManager_h__

#if defined(_MSC_VER) && (_MSC_VER >= 1020)
#pragma once
#endif

/* Forward Declarations */ 

#ifndef __IIEWebDriverManager_FWD_DEFINED__
#define __IIEWebDriverManager_FWD_DEFINED__
typedef interface IIEWebDriverManager IIEWebDriverManager;
#endif 	/* __IIEWebDriverManager_FWD_DEFINED__ */


#ifndef __IIEWebDriverSite_FWD_DEFINED__
#define __IIEWebDriverSite_FWD_DEFINED__
typedef interface IIEWebDriverSite IIEWebDriverSite;
#endif 	/* __IIEWebDriverSite_FWD_DEFINED__ */


#ifndef __IEWebDriverManager_FWD_DEFINED__
#define __IEWebDriverManager_FWD_DEFINED__

#ifdef __cplusplus
typedef class IEWebDriverManager IEWebDriverManager;
#else
typedef struct IEWebDriverManager IEWebDriverManager;
#endif /* __cplusplus */

#endif 	/* __IEWebDriverManager_FWD_DEFINED__ */


#ifdef __cplusplus
extern "C"{
#endif 



#ifndef __IEWebDriverLib_LIBRARY_DEFINED__
#define __IEWebDriverLib_LIBRARY_DEFINED__

/* library IEWebDriverLib */
/* [version][uuid] */ 




EXTERN_C const IID LIBID_IEWebDriverLib;

#ifndef __IIEWebDriverManager_INTERFACE_DEFINED__
#define __IIEWebDriverManager_INTERFACE_DEFINED__

/* interface IIEWebDriverManager */
/* [object][oleautomation][nonextensible][dual][uuid] */ 


EXTERN_C const IID IID_IIEWebDriverManager;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("BD1DC630-6590-4CA2-A293-6BC72B2438D8")
    IIEWebDriverManager : public IDispatch
    {
    public:
        virtual /* [id] */ HRESULT STDMETHODCALLTYPE ExecuteCommand( 
            /* [in] */ LPWSTR command,
            /* [out] */ LPWSTR *response) = 0;
        
    };
    
#else 	/* C style interface */

    typedef struct IIEWebDriverManagerVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IIEWebDriverManager * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            __RPC__deref_out  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IIEWebDriverManager * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IIEWebDriverManager * This);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfoCount )( 
            IIEWebDriverManager * This,
            /* [out] */ UINT *pctinfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfo )( 
            IIEWebDriverManager * This,
            /* [in] */ UINT iTInfo,
            /* [in] */ LCID lcid,
            /* [out] */ ITypeInfo **ppTInfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetIDsOfNames )( 
            IIEWebDriverManager * This,
            /* [in] */ REFIID riid,
            /* [size_is][in] */ LPOLESTR *rgszNames,
            /* [range][in] */ UINT cNames,
            /* [in] */ LCID lcid,
            /* [size_is][out] */ DISPID *rgDispId);
        
        /* [local] */ HRESULT ( STDMETHODCALLTYPE *Invoke )( 
            IIEWebDriverManager * This,
            /* [in] */ DISPID dispIdMember,
            /* [in] */ REFIID riid,
            /* [in] */ LCID lcid,
            /* [in] */ WORD wFlags,
            /* [out][in] */ DISPPARAMS *pDispParams,
            /* [out] */ VARIANT *pVarResult,
            /* [out] */ EXCEPINFO *pExcepInfo,
            /* [out] */ UINT *puArgErr);
        
        /* [id] */ HRESULT ( STDMETHODCALLTYPE *ExecuteCommand )( 
            IIEWebDriverManager * This,
            /* [in] */ LPWSTR command,
            /* [out] */ LPWSTR *response);
        
        END_INTERFACE
    } IIEWebDriverManagerVtbl;

    interface IIEWebDriverManager
    {
        CONST_VTBL struct IIEWebDriverManagerVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IIEWebDriverManager_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IIEWebDriverManager_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IIEWebDriverManager_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IIEWebDriverManager_GetTypeInfoCount(This,pctinfo)	\
    ( (This)->lpVtbl -> GetTypeInfoCount(This,pctinfo) ) 

#define IIEWebDriverManager_GetTypeInfo(This,iTInfo,lcid,ppTInfo)	\
    ( (This)->lpVtbl -> GetTypeInfo(This,iTInfo,lcid,ppTInfo) ) 

#define IIEWebDriverManager_GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId)	\
    ( (This)->lpVtbl -> GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId) ) 

#define IIEWebDriverManager_Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr)	\
    ( (This)->lpVtbl -> Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr) ) 


#define IIEWebDriverManager_ExecuteCommand(This,command,response)	\
    ( (This)->lpVtbl -> ExecuteCommand(This,command,response) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IIEWebDriverManager_INTERFACE_DEFINED__ */


#ifndef __IIEWebDriverSite_INTERFACE_DEFINED__
#define __IIEWebDriverSite_INTERFACE_DEFINED__

/* interface IIEWebDriverSite */
/* [object][oleautomation][nonextensible][dual][uuid] */ 


EXTERN_C const IID IID_IIEWebDriverSite;

#if defined(__cplusplus) && !defined(CINTERFACE)
    
    MIDL_INTERFACE("FFB84444-453D-4FBC-9F9D-8DB5C471EC75")
    IIEWebDriverSite : public IDispatch
    {
    public:
        virtual /* [id] */ HRESULT STDMETHODCALLTYPE WindowOperation( 
            /* [in] */ unsigned long operationCode,
            /* [in] */ unsigned long hWnd) = 0;
        
        virtual /* [id] */ HRESULT STDMETHODCALLTYPE DetachWebdriver( 
            /* [in] */ IUnknown *pUnkWD) = 0;
        
        virtual /* [id] */ HRESULT STDMETHODCALLTYPE GetCapabilityValue( 
            /* [in] */ IUnknown *pUnkWD,
            /* [in] */ LPWSTR capName,
            /* [out] */ VARIANT *capValue) = 0;
        
    };
    
#else 	/* C style interface */

    typedef struct IIEWebDriverSiteVtbl
    {
        BEGIN_INTERFACE
        
        HRESULT ( STDMETHODCALLTYPE *QueryInterface )( 
            IIEWebDriverSite * This,
            /* [in] */ REFIID riid,
            /* [annotation][iid_is][out] */ 
            __RPC__deref_out  void **ppvObject);
        
        ULONG ( STDMETHODCALLTYPE *AddRef )( 
            IIEWebDriverSite * This);
        
        ULONG ( STDMETHODCALLTYPE *Release )( 
            IIEWebDriverSite * This);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfoCount )( 
            IIEWebDriverSite * This,
            /* [out] */ UINT *pctinfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetTypeInfo )( 
            IIEWebDriverSite * This,
            /* [in] */ UINT iTInfo,
            /* [in] */ LCID lcid,
            /* [out] */ ITypeInfo **ppTInfo);
        
        HRESULT ( STDMETHODCALLTYPE *GetIDsOfNames )( 
            IIEWebDriverSite * This,
            /* [in] */ REFIID riid,
            /* [size_is][in] */ LPOLESTR *rgszNames,
            /* [range][in] */ UINT cNames,
            /* [in] */ LCID lcid,
            /* [size_is][out] */ DISPID *rgDispId);
        
        /* [local] */ HRESULT ( STDMETHODCALLTYPE *Invoke )( 
            IIEWebDriverSite * This,
            /* [in] */ DISPID dispIdMember,
            /* [in] */ REFIID riid,
            /* [in] */ LCID lcid,
            /* [in] */ WORD wFlags,
            /* [out][in] */ DISPPARAMS *pDispParams,
            /* [out] */ VARIANT *pVarResult,
            /* [out] */ EXCEPINFO *pExcepInfo,
            /* [out] */ UINT *puArgErr);
        
        /* [id] */ HRESULT ( STDMETHODCALLTYPE *WindowOperation )( 
            IIEWebDriverSite * This,
            /* [in] */ unsigned long operationCode,
            /* [in] */ unsigned long hWnd);
        
        /* [id] */ HRESULT ( STDMETHODCALLTYPE *DetachWebdriver )( 
            IIEWebDriverSite * This,
            /* [in] */ IUnknown *pUnkWD);
        
        /* [id] */ HRESULT ( STDMETHODCALLTYPE *GetCapabilityValue )( 
            IIEWebDriverSite * This,
            /* [in] */ IUnknown *pUnkWD,
            /* [in] */ LPWSTR capName,
            /* [out] */ VARIANT *capValue);
        
        END_INTERFACE
    } IIEWebDriverSiteVtbl;

    interface IIEWebDriverSite
    {
        CONST_VTBL struct IIEWebDriverSiteVtbl *lpVtbl;
    };

    

#ifdef COBJMACROS


#define IIEWebDriverSite_QueryInterface(This,riid,ppvObject)	\
    ( (This)->lpVtbl -> QueryInterface(This,riid,ppvObject) ) 

#define IIEWebDriverSite_AddRef(This)	\
    ( (This)->lpVtbl -> AddRef(This) ) 

#define IIEWebDriverSite_Release(This)	\
    ( (This)->lpVtbl -> Release(This) ) 


#define IIEWebDriverSite_GetTypeInfoCount(This,pctinfo)	\
    ( (This)->lpVtbl -> GetTypeInfoCount(This,pctinfo) ) 

#define IIEWebDriverSite_GetTypeInfo(This,iTInfo,lcid,ppTInfo)	\
    ( (This)->lpVtbl -> GetTypeInfo(This,iTInfo,lcid,ppTInfo) ) 

#define IIEWebDriverSite_GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId)	\
    ( (This)->lpVtbl -> GetIDsOfNames(This,riid,rgszNames,cNames,lcid,rgDispId) ) 

#define IIEWebDriverSite_Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr)	\
    ( (This)->lpVtbl -> Invoke(This,dispIdMember,riid,lcid,wFlags,pDispParams,pVarResult,pExcepInfo,puArgErr) ) 


#define IIEWebDriverSite_WindowOperation(This,operationCode,hWnd)	\
    ( (This)->lpVtbl -> WindowOperation(This,operationCode,hWnd) ) 

#define IIEWebDriverSite_DetachWebdriver(This,pUnkWD)	\
    ( (This)->lpVtbl -> DetachWebdriver(This,pUnkWD) ) 

#define IIEWebDriverSite_GetCapabilityValue(This,pUnkWD,capName,capValue)	\
    ( (This)->lpVtbl -> GetCapabilityValue(This,pUnkWD,capName,capValue) ) 

#endif /* COBJMACROS */


#endif 	/* C style interface */




#endif 	/* __IIEWebDriverSite_INTERFACE_DEFINED__ */


EXTERN_C const CLSID CLSID_IEWebDriverManager;

#ifdef __cplusplus

class DECLSPEC_UUID("90314AF2-5250-47B3-89D8-6295FC23BC22")
IEWebDriverManager;
#endif
#endif /* __IEWebDriverLib_LIBRARY_DEFINED__ */

/* Additional Prototypes for ALL interfaces */

/* end of Additional Prototypes */

#ifdef __cplusplus
}
#endif

#endif


