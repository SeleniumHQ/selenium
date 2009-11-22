// Copyright (c) 2006-2008 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// TODO:  Did not implement JRIGlobalRef function yet.  Not sure if this is used?

#ifndef WEBKIT_GLUE_PLUGIN_NPHOSTAPI_H__
#define WEBKIT_GLUE_PLUGIN_NPHOSTAPI_H__

#include "base/port.h"
#include "npapi/bindings/npapi.h"
#include "npapi/bindings/npruntime.h"

#ifdef __cplusplus
extern "C" {
#endif

//
// NPAPI NPP Function Pointers
//
typedef NPError      (*NPP_NewProcPtr)(NPMIMEType pluginType,
                         NPP instance,
                         uint16 mode,
                         int16 argc,
                         char* argn[],
                         char* argv[],
                         NPSavedData* saved);
typedef NPError      (*NPP_DestroyProcPtr)(NPP instance,
                         NPSavedData** save);
typedef NPError      (*NPP_SetWindowProcPtr)(NPP instance,
                         NPWindow* window);
typedef NPError      (*NPP_NewStreamProcPtr)(NPP instance,
                         NPMIMEType type,
                         NPStream* stream,
                         NPBool seekable,
                         uint16* stype);
typedef NPError      (*NPP_DestroyStreamProcPtr)(NPP instance,
                         NPStream* stream,
                         NPReason reason);
typedef int32        (*NPP_WriteReadyProcPtr)(NPP instance,
                         NPStream* stream);
typedef int32        (*NPP_WriteProcPtr)(NPP instance,
                         NPStream* stream,
                         int32 offset,
                         int32 len,
                         void* buffer);
typedef void         (*NPP_StreamAsFileProcPtr)(NPP instance,
                         NPStream* stream,
                         const char* fname);
typedef void         (*NPP_PrintProcPtr)(NPP instance,
                         NPPrint* platformPrint);
typedef int16        (*NPP_HandleEventProcPtr)(NPP instance,
                         void* event);
typedef void         (*NPP_URLNotifyProcPtr)(NPP instance,
                         const char* url,
                         NPReason reason,
                         void* notifyData);
typedef void* JRIGlobalRef; //not using this right now
typedef NPError      (*NPP_GetValueProcPtr)(NPP instance,
                         NPPVariable variable,
                         void *ret_alue);
typedef NPError      (*NPP_SetValueProcPtr)(NPP instance,
                         NPNVariable variable,
                         void *ret_alue);

//
// NPAPI NPN Function Pointers
//
typedef NPError      (*NPN_GetURLProcPtr)(NPP instance,
                         const char* URL,
                         const char* window);
typedef NPError      (*NPN_PostURLProcPtr)(NPP instance,
                         const char* URL,
                         const char* window,
                         uint32 len,
                         const char* buf,
                         NPBool file);
typedef NPError      (*NPN_RequestReadProcPtr)(NPStream* stream,
                         NPByteRange* rangeList);
typedef NPError      (*NPN_NewStreamProcPtr)(NPP instance,
                         NPMIMEType type,
                         const char* window,
                         NPStream** stream);
typedef int32        (*NPN_WriteProcPtr)(NPP instance,
                         NPStream* stream,
                         int32 len,
                         void* buffer);
typedef NPError      (*NPN_DestroyStreamProcPtr)(NPP instance,
                         NPStream* stream,
                         NPReason reason);
typedef void         (*NPN_StatusProcPtr)(NPP instance,
                         const char* message);
typedef const char*  (*NPN_UserAgentProcPtr)(NPP instance);
typedef void*        (*NPN_MemAllocProcPtr)(uint32 size);
typedef void         (*NPN_MemFreeProcPtr)(void* ptr);
typedef uint32       (*NPN_MemFlushProcPtr)(uint32 size);
typedef void         (*NPN_ReloadPluginsProcPtr)(NPBool reloadPages);

typedef void*        (*NPN_GetJavaEnvProcPtr)(void);
typedef void*        (*NPN_GetJavaPeerProcPtr)(NPP instance);

typedef NPError      (*NPN_GetURLNotifyProcPtr)(NPP instance,
                         const char* URL,
                         const char* window,
                         void* notifyData);
typedef NPError      (*NPN_PostURLNotifyProcPtr)(NPP instance,
                         const char* URL,
                         const char* window,
                         uint32 len,
                         const char* buf,
                         NPBool file,
                         void* notifyData);
typedef NPError      (*NPN_GetValueProcPtr)(NPP instance,
                         NPNVariable variable,
                         void *ret_value);
typedef NPError      (*NPN_SetValueProcPtr)(NPP instance,
                         NPPVariable variable,
                         void *value);
typedef void         (*NPN_InvalidateRectProcPtr)(NPP instance,
                         NPRect *rect);
typedef void         (*NPN_InvalidateRegionProcPtr)(NPP instance,
                         NPRegion region);
typedef void         (*NPN_ForceRedrawProcPtr)(NPP instance);

typedef void         (*NPN_ReleaseVariantValueProcPtr) (NPVariant *variant);

typedef NPIdentifier (*NPN_GetStringIdentifierProcPtr) (const NPUTF8 *name);
typedef void         (*NPN_GetStringIdentifiersProcPtr) (const NPUTF8 **names,
                         int32_t nameCount,
                         NPIdentifier *identifiers);
typedef NPIdentifier (*NPN_GetIntIdentifierProcPtr) (int32_t intid);
typedef int32_t      (*NPN_IntFromIdentifierProcPtr) (NPIdentifier identifier);
typedef bool         (*NPN_IdentifierIsStringProcPtr) (NPIdentifier identifier);
typedef NPUTF8 *     (*NPN_UTF8FromIdentifierProcPtr) (NPIdentifier identifier);

typedef NPObject*    (*NPN_CreateObjectProcPtr) (NPP,
                         NPClass *aClass);
typedef NPObject*    (*NPN_RetainObjectProcPtr) (NPObject *obj);
typedef void         (*NPN_ReleaseObjectProcPtr) (NPObject *obj);
typedef bool         (*NPN_InvokeProcPtr) (NPP npp,
                         NPObject *obj,
                         NPIdentifier methodName,
                         const NPVariant *args,
                         unsigned argCount,
                         NPVariant *result);
typedef bool         (*NPN_InvokeDefaultProcPtr) (NPP npp,
                         NPObject *obj,
                         const NPVariant *args,
                         unsigned argCount,
                         NPVariant *result);
typedef bool         (*NPN_EvaluateProcPtr) (NPP npp,
                         NPObject *obj,
                         NPString *script,
                         NPVariant *result);
typedef bool         (*NPN_GetPropertyProcPtr) (NPP npp,
                         NPObject *obj,
                         NPIdentifier propertyName,
                         NPVariant *result);
typedef bool         (*NPN_SetPropertyProcPtr) (NPP npp,
                         NPObject *obj,
                         NPIdentifier propertyName,
                         const NPVariant *value);
typedef bool         (*NPN_HasPropertyProcPtr) (NPP,
                         NPObject *npobj,
                         NPIdentifier propertyName);
typedef bool         (*NPN_HasMethodProcPtr) (NPP npp,
                         NPObject *npobj,
                         NPIdentifier methodName);
typedef bool         (*NPN_RemovePropertyProcPtr) (NPP npp,
                         NPObject *obj,
                         NPIdentifier propertyName);
typedef void         (*NPN_SetExceptionProcPtr) (NPObject *obj,
                         const NPUTF8 *message);
typedef void         (*NPN_PushPopupsEnabledStateProcPtr)(NPP npp,
                         NPBool enabled);
typedef void         (*NPN_PopPopupsEnabledStateProcPtr)(NPP npp);
typedef bool         (*NPN_EnumerateProcPtr)(NPP npp,
                         NPObject *obj,
                         NPIdentifier **identifier,
                         uint32_t *count);
typedef void         (*NPN_PluginThreadAsyncCallProcPtr)(NPP instance,
                         void (*func)(void *),
                         void *userData);
typedef bool         (*NPN_ConstructProcPtr)(NPP npp,
                         NPObject* obj,
                         const NPVariant *args,
                         uint32_t argCount,
                         NPVariant *result);

//
// NPAPI Function table of NPP functions (functions provided by plugin to host)
//
typedef struct _NPPluginFuncs {
    unsigned short size;
    unsigned short version;
    NPP_NewProcPtr newp;
    NPP_DestroyProcPtr destroy;
    NPP_SetWindowProcPtr setwindow;
    NPP_NewStreamProcPtr newstream;
    NPP_DestroyStreamProcPtr destroystream;
    NPP_StreamAsFileProcPtr asfile;
    NPP_WriteReadyProcPtr writeready;
    NPP_WriteProcPtr write;
    NPP_PrintProcPtr print;
    NPP_HandleEventProcPtr event;
    NPP_URLNotifyProcPtr urlnotify;
    JRIGlobalRef javaClass;
    NPP_GetValueProcPtr getvalue;
    NPP_SetValueProcPtr setvalue;
} NPPluginFuncs;

//
// NPAPI Function table NPN functions (functions provided by host to plugin)
//
typedef struct _NPNetscapeFuncs {
    uint16 size;
    uint16 version;
    NPN_GetURLProcPtr geturl;
    NPN_PostURLProcPtr posturl;
    NPN_RequestReadProcPtr requestread;
    NPN_NewStreamProcPtr newstream;
    NPN_WriteProcPtr write;
    NPN_DestroyStreamProcPtr destroystream;
    NPN_StatusProcPtr status;
    NPN_UserAgentProcPtr uagent;
    NPN_MemAllocProcPtr memalloc;
    NPN_MemFreeProcPtr memfree;
    NPN_MemFlushProcPtr memflush;
    NPN_ReloadPluginsProcPtr reloadplugins;
    NPN_GetJavaEnvProcPtr getJavaEnv;
    NPN_GetJavaPeerProcPtr getJavaPeer;
    NPN_GetURLNotifyProcPtr geturlnotify;
    NPN_PostURLNotifyProcPtr posturlnotify;
    NPN_GetValueProcPtr getvalue;
    NPN_SetValueProcPtr setvalue;
    NPN_InvalidateRectProcPtr invalidaterect;
    NPN_InvalidateRegionProcPtr invalidateregion;
    NPN_ForceRedrawProcPtr forceredraw;

    NPN_GetStringIdentifierProcPtr getstringidentifier;
    NPN_GetStringIdentifiersProcPtr getstringidentifiers;
    NPN_GetIntIdentifierProcPtr getintidentifier;
    NPN_IdentifierIsStringProcPtr identifierisstring;
    NPN_UTF8FromIdentifierProcPtr utf8fromidentifier;
    NPN_IntFromIdentifierProcPtr intfromidentifier;
    NPN_CreateObjectProcPtr createobject;
    NPN_RetainObjectProcPtr retainobject;
    NPN_ReleaseObjectProcPtr releaseobject;
    NPN_InvokeProcPtr invoke;
    NPN_InvokeDefaultProcPtr invokeDefault;
    NPN_EvaluateProcPtr evaluate;
    NPN_GetPropertyProcPtr getproperty;
    NPN_SetPropertyProcPtr setproperty;
    NPN_RemovePropertyProcPtr removeproperty;
    NPN_HasPropertyProcPtr hasproperty;
    NPN_HasMethodProcPtr hasmethod;
    NPN_ReleaseVariantValueProcPtr releasevariantvalue;
    NPN_SetExceptionProcPtr setexception;
    NPN_PushPopupsEnabledStateProcPtr pushpopupsenabledstate;
    NPN_PopPopupsEnabledStateProcPtr poppopupsenabledstate;
    NPN_EnumerateProcPtr enumerate;
    NPN_PluginThreadAsyncCallProcPtr pluginthreadasynccall;
    NPN_ConstructProcPtr construct;
} NPNetscapeFuncs;

//
// NPAPI library entry points
//
#if defined(OS_LINUX)
typedef NPError (API_CALL * NP_InitializeFunc)(NPNetscapeFuncs* pNFuncs,
                                               NPPluginFuncs* pPFuncs);
#else
typedef NPError (API_CALL * NP_InitializeFunc)(NPNetscapeFuncs* pFuncs);
typedef NPError (API_CALL * NP_GetEntryPointsFunc)(NPPluginFuncs* pFuncs);
#endif
typedef NPError (API_CALL * NP_ShutdownFunc)(void);

#ifdef __cplusplus
} // extern "C"
#endif

#endif // WEBKIT_GLUE_PLUGIN_NPHOSTAPI_H__
