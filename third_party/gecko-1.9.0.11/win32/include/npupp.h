/* -*- Mode: C; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*- */
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
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
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


/*
 *  npupp.h $Revision: 3.26 $
 *  function call mecahnics needed by platform specific glue code.
 */


#ifndef _NPUPP_H_
#define _NPUPP_H_

#if defined(__OS2__)
#pragma pack(1)
#endif

#ifndef GENERATINGCFM
#define GENERATINGCFM 0
#endif

#ifndef _NPAPI_H_
#include "npapi.h"
#endif

#include "npruntime.h"

#include "jri.h"


/******************************************************************************************
   plug-in function table macros
 	        for each function in and out of the plugin API we define
                    typedef NPP_FooUPP
					#define NewNPP_FooProc
					#define CallNPP_FooProc
 *******************************************************************************************/


/* NPP_Initialize */
typedef void (* NP_LOADDS NPP_InitializeUPP)(void);
#define NewNPP_InitializeProc(FUNC)		\
		((NPP_InitializeUPP) (FUNC))
#define CallNPP_InitializeProc(FUNC)		\
		(*(FUNC))()

/* NPP_Shutdown */
typedef void (* NP_LOADDS NPP_ShutdownUPP)(void);
#define NewNPP_ShutdownProc(FUNC)		\
		((NPP_ShutdownUPP) (FUNC))
#define CallNPP_ShutdownProc(FUNC)		\
		(*(FUNC))()

/* NPP_New */
typedef NPError	(* NP_LOADDS NPP_NewUPP)(NPMIMEType pluginType, NPP instance, uint16 mode, int16 argc, char* argn[], char* argv[], NPSavedData* saved);
#define NewNPP_NewProc(FUNC)		\
		((NPP_NewUPP) (FUNC))
#define CallNPP_NewProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5, ARG6, ARG7)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5), (ARG6), (ARG7))

/* NPP_Destroy */
typedef NPError	(* NP_LOADDS NPP_DestroyUPP)(NPP instance, NPSavedData** save);
#define NewNPP_DestroyProc(FUNC)		\
		((NPP_DestroyUPP) (FUNC))
#define CallNPP_DestroyProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))

/* NPP_SetWindow */
typedef NPError	(* NP_LOADDS NPP_SetWindowUPP)(NPP instance, NPWindow* window);
#define NewNPP_SetWindowProc(FUNC)		\
		((NPP_SetWindowUPP) (FUNC))
#define CallNPP_SetWindowProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))

/* NPP_NewStream */
typedef NPError	(* NP_LOADDS NPP_NewStreamUPP)(NPP instance, NPMIMEType type, NPStream* stream, NPBool seekable, uint16* stype);
#define NewNPP_NewStreamProc(FUNC)		\
		((NPP_NewStreamUPP) (FUNC))
#define CallNPP_NewStreamProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5) \
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5))

/* NPP_DestroyStream */
typedef NPError	(* NP_LOADDS NPP_DestroyStreamUPP)(NPP instance, NPStream* stream, NPReason reason);
#define NewNPP_DestroyStreamProc(FUNC)		\
		((NPP_DestroyStreamUPP) (FUNC))
#define CallNPP_DestroyStreamProc(FUNC,  NPParg, NPStreamPtr, NPReasonArg)		\
		(*(FUNC))((NPParg), (NPStreamPtr), (NPReasonArg))

/* NPP_WriteReady */
typedef int32 (* NP_LOADDS NPP_WriteReadyUPP)(NPP instance, NPStream* stream);
#define NewNPP_WriteReadyProc(FUNC)		\
		((NPP_WriteReadyUPP) (FUNC))
#define CallNPP_WriteReadyProc(FUNC,  NPParg, NPStreamPtr)		\
		(*(FUNC))((NPParg), (NPStreamPtr))

/* NPP_Write */
typedef int32 (* NP_LOADDS NPP_WriteUPP)(NPP instance, NPStream* stream, int32 offset, int32 len, void* buffer);
#define NewNPP_WriteProc(FUNC)		\
		((NPP_WriteUPP) (FUNC))
#define CallNPP_WriteProc(FUNC,  NPParg, NPStreamPtr, offsetArg, lenArg, bufferPtr)		\
		(*(FUNC))((NPParg), (NPStreamPtr), (offsetArg), (lenArg), (bufferPtr))

/* NPP_StreamAsFile */
typedef void (* NP_LOADDS NPP_StreamAsFileUPP)(NPP instance, NPStream* stream, const char* fname);
#define NewNPP_StreamAsFileProc(FUNC)		\
		((NPP_StreamAsFileUPP) (FUNC))
#define CallNPP_StreamAsFileProc(FUNC,  ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPP_Print */
typedef void (* NP_LOADDS NPP_PrintUPP)(NPP instance, NPPrint* platformPrint);
#define NewNPP_PrintProc(FUNC)		\
		((NPP_PrintUPP) (FUNC))
#define CallNPP_PrintProc(FUNC,  NPParg, NPPrintArg)		\
		(*(FUNC))((NPParg), (NPPrintArg))

/* NPP_HandleEvent */
typedef int16 (* NP_LOADDS NPP_HandleEventUPP)(NPP instance, void* event);
#define NewNPP_HandleEventProc(FUNC)		\
		((NPP_HandleEventUPP) (FUNC))
#define CallNPP_HandleEventProc(FUNC,  NPParg, voidPtr)		\
		(*(FUNC))((NPParg), (voidPtr))

/* NPP_URLNotify */
typedef void (* NP_LOADDS NPP_URLNotifyUPP)(NPP instance, const char* url, NPReason reason, void* notifyData);
#define NewNPP_URLNotifyProc(FUNC)		\
		((NPP_URLNotifyUPP) (FUNC))
#define CallNPP_URLNotifyProc(FUNC,  ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPP_GetValue */
typedef NPError	(* NP_LOADDS NPP_GetValueUPP)(NPP instance, NPPVariable variable, void *ret_alue);
#define NewNPP_GetValueProc(FUNC)		\
		((NPP_GetValueUPP) (FUNC))
#define CallNPP_GetValueProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPP_SetValue */
typedef NPError	(* NP_LOADDS NPP_SetValueUPP)(NPP instance, NPNVariable variable, void *ret_alue);
#define NewNPP_SetValueProc(FUNC)		\
		((NPP_SetValueUPP) (FUNC))
#define CallNPP_SetValueProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/*
 *  Netscape entry points
 */


/* NPN_GetValue */
typedef NPError	(* NP_LOADDS NPN_GetValueUPP)(NPP instance, NPNVariable variable, void *ret_alue);
#define NewNPN_GetValueProc(FUNC)		\
		((NPN_GetValueUPP) (FUNC))
#define CallNPN_GetValueProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_SetValue */
typedef NPError	(* NP_LOADDS NPN_SetValueUPP)(NPP instance, NPPVariable variable, void *ret_alue);
#define NewNPN_SetValueProc(FUNC)		\
		((NPN_SetValueUPP) (FUNC))
#define CallNPN_SetValueProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_GetUrlNotify */
typedef NPError	(* NP_LOADDS NPN_GetURLNotifyUPP)(NPP instance, const char* url, const char* window, void* notifyData);
#define NewNPN_GetURLNotifyProc(FUNC)		\
		((NPN_GetURLNotifyUPP) (FUNC))
#define CallNPN_GetURLNotifyProc(FUNC, ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPN_PostUrlNotify */
typedef NPError (* NP_LOADDS NPN_PostURLNotifyUPP)(NPP instance, const char* url, const char* window, uint32 len, const char* buf, NPBool file, void* notifyData);
#define NewNPN_PostURLNotifyProc(FUNC)		\
		((NPN_PostURLNotifyUPP) (FUNC))
#define CallNPN_PostURLNotifyProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5, ARG6, ARG7) \
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5), (ARG6), (ARG7))

/* NPN_GetUrl */
typedef NPError	(* NP_LOADDS NPN_GetURLUPP)(NPP instance, const char* url, const char* window);
#define NewNPN_GetURLProc(FUNC)		\
		((NPN_GetURLUPP) (FUNC))
#define CallNPN_GetURLProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_PostUrl */
typedef NPError (* NP_LOADDS NPN_PostURLUPP)(NPP instance, const char* url, const char* window, uint32 len, const char* buf, NPBool file);
#define NewNPN_PostURLProc(FUNC)		\
		((NPN_PostURLUPP) (FUNC))
#define CallNPN_PostURLProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5, ARG6) \
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5), (ARG6))

/* NPN_RequestRead */
typedef NPError	(* NP_LOADDS NPN_RequestReadUPP)(NPStream* stream, NPByteRange* rangeList);
#define NewNPN_RequestReadProc(FUNC)		\
		((NPN_RequestReadUPP) (FUNC))
#define CallNPN_RequestReadProc(FUNC, stream, range)		\
		(*(FUNC))((stream), (range))

/* NPN_NewStream */
typedef NPError	(* NP_LOADDS NPN_NewStreamUPP)(NPP instance, NPMIMEType type, const char* window, NPStream** stream);
#define NewNPN_NewStreamProc(FUNC)		\
		((NPN_NewStreamUPP) (FUNC))
#define CallNPN_NewStreamProc(FUNC, npp, type, window, stream)		\
		(*(FUNC))((npp), (type), (window), (stream))

/* NPN_Write */
typedef int32 (* NP_LOADDS NPN_WriteUPP)(NPP instance, NPStream* stream, int32 len, void* buffer);
#define NewNPN_WriteProc(FUNC)		\
		((NPN_WriteUPP) (FUNC))
#define CallNPN_WriteProc(FUNC, npp, stream, len, buffer)		\
		(*(FUNC))((npp), (stream), (len), (buffer))

/* NPN_DestroyStream */
typedef NPError (* NP_LOADDS NPN_DestroyStreamUPP)(NPP instance, NPStream* stream, NPReason reason);
#define NewNPN_DestroyStreamProc(FUNC)		\
		((NPN_DestroyStreamUPP) (FUNC))
#define CallNPN_DestroyStreamProc(FUNC, npp, stream, reason)		\
		(*(FUNC))((npp), (stream), (reason))

/* NPN_Status */
typedef void (* NP_LOADDS NPN_StatusUPP)(NPP instance, const char* message);
#define NewNPN_StatusProc(FUNC)		\
		((NPN_StatusUPP) (FUNC))
#define CallNPN_StatusProc(FUNC, npp, msg)		\
		(*(FUNC))((npp), (msg))	

/* NPN_UserAgent */
typedef const char*	(* NP_LOADDS NPN_UserAgentUPP)(NPP instance);
#define NewNPN_UserAgentProc(FUNC)              \
                ((NPN_UserAgentUPP) (FUNC))
#define CallNPN_UserAgentProc(FUNC, ARG1)               \
                (*(FUNC))((ARG1))

/* NPN_MemAlloc */
typedef void* (* NP_LOADDS NPN_MemAllocUPP)(uint32 size);
#define NewNPN_MemAllocProc(FUNC)		\
		((NPN_MemAllocUPP) (FUNC))
#define CallNPN_MemAllocProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN__MemFree */
typedef void (* NP_LOADDS NPN_MemFreeUPP)(void* ptr);
#define NewNPN_MemFreeProc(FUNC)		\
		((NPN_MemFreeUPP) (FUNC))
#define CallNPN_MemFreeProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN_MemFlush */
typedef uint32 (* NP_LOADDS NPN_MemFlushUPP)(uint32 size);
#define NewNPN_MemFlushProc(FUNC)		\
		((NPN_MemFlushUPP) (FUNC))
#define CallNPN_MemFlushProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN_ReloadPlugins */
typedef void (* NP_LOADDS NPN_ReloadPluginsUPP)(NPBool reloadPages);
#define NewNPN_ReloadPluginsProc(FUNC)		\
		((NPN_ReloadPluginsUPP) (FUNC))
#define CallNPN_ReloadPluginsProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN_GetJavaEnv */
typedef JRIEnv* (* NP_LOADDS NPN_GetJavaEnvUPP)(void);
#define NewNPN_GetJavaEnvProc(FUNC)		\
		((NPN_GetJavaEnvUPP) (FUNC))
#define CallNPN_GetJavaEnvProc(FUNC)		\
		(*(FUNC))()	

/* NPN_GetJavaPeer */
typedef jref (* NP_LOADDS NPN_GetJavaPeerUPP)(NPP instance);
#define NewNPN_GetJavaPeerProc(FUNC)		\
		((NPN_GetJavaPeerUPP) (FUNC))
#define CallNPN_GetJavaPeerProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN_InvalidateRect */
typedef void (* NP_LOADDS NPN_InvalidateRectUPP)(NPP instance, NPRect *rect);
#define NewNPN_InvalidateRectProc(FUNC)		\
		((NPN_InvalidateRectUPP) (FUNC))
#define CallNPN_InvalidateRectProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))	

/* NPN_InvalidateRegion */
typedef void (* NP_LOADDS NPN_InvalidateRegionUPP)(NPP instance, NPRegion region);
#define NewNPN_InvalidateRegionProc(FUNC)		\
		((NPN_InvalidateRegionUPP) (FUNC))
#define CallNPN_InvalidateRegionProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))	

/* NPN_ForceRedraw */
typedef void (* NP_LOADDS NPN_ForceRedrawUPP)(NPP instance);
#define NewNPN_ForceRedrawProc(FUNC)		\
		((NPN_ForceRedrawUPP) (FUNC))
#define CallNPN_ForceRedrawProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))	

/* NPN_GetStringIdentifier */
typedef NPIdentifier (* NP_LOADDS NPN_GetStringIdentifierUPP)(const NPUTF8* name);
#define NewNPN_GetStringIdentifierProc(FUNC)		\
		((NPN_GetStringIdentifierUPP) (FUNC))
#define CallNPN_GetStringIdentifierProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_GetStringIdentifiers */
typedef void (* NP_LOADDS NPN_GetStringIdentifiersUPP)(const NPUTF8** names,
                                                 int32_t nameCount,
                                                 NPIdentifier* identifiers);
#define NewNPN_GetStringIdentifiersProc(FUNC)		\
		((NPN_GetStringIdentifiersUPP) (FUNC))
#define CallNPN_GetStringIdentifiersProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_GetIntIdentifier */
typedef NPIdentifier (* NP_LOADDS NPN_GetIntIdentifierUPP)(int32_t intid);
#define NewNPN_GetIntIdentifierProc(FUNC)		\
		((NPN_GetIntIdentifierUPP) (FUNC))
#define CallNPN_GetIntIdentifierProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_IdentifierIsString */
typedef bool (* NP_LOADDS NPN_IdentifierIsStringUPP)(NPIdentifier identifier);
#define NewNPN_IdentifierIsStringProc(FUNC)		\
		((NPN_IdentifierIsStringUPP) (FUNC))
#define CallNPN_IdentifierIsStringProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_UTF8FromIdentifier */
typedef NPUTF8* (* NP_LOADDS NPN_UTF8FromIdentifierUPP)(NPIdentifier identifier);
#define NewNPN_UTF8FromIdentifierProc(FUNC)		\
		((NPN_UTF8FromIdentifierUPP) (FUNC))
#define CallNPN_UTF8FromIdentifierProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_IntFromIdentifier */
typedef int32_t (* NP_LOADDS NPN_IntFromIdentifierUPP)(NPIdentifier identifier);
#define NewNPN_IntFromIdentifierProc(FUNC)		\
		((NPN_IntFromIdentifierUPP) (FUNC))
#define CallNPN_IntFromIdentifierProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_CreateObject */
typedef NPObject* (* NP_LOADDS NPN_CreateObjectUPP)(NPP npp, NPClass *aClass);
#define NewNPN_CreateObjectProc(FUNC)		\
		((NPN_CreateObjectUPP) (FUNC))
#define CallNPN_CreateObjectProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))

/* NPN_RetainObject */
typedef NPObject* (* NP_LOADDS NPN_RetainObjectUPP)(NPObject *obj);
#define NewNPN_RetainObjectProc(FUNC)		\
		((NPN_RetainObjectUPP) (FUNC))
#define CallNPN_RetainObjectProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_ReleaseObject */
typedef void (* NP_LOADDS NPN_ReleaseObjectUPP)(NPObject *obj);
#define NewNPN_ReleaseObjectProc(FUNC)		\
		((NPN_ReleaseObjectUPP) (FUNC))
#define CallNPN_ReleaseObjectProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_Invoke */
typedef bool (* NP_LOADDS NPN_InvokeUPP)(NPP npp, NPObject* obj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result);
#define NewNPN_InvokeProc(FUNC)		\
		((NPN_InvokeUPP) (FUNC))
#define CallNPN_InvokeProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5, ARG6)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5), (ARG6))

/* NPN_InvokeDefault */
typedef bool (* NP_LOADDS NPN_InvokeDefaultUPP)(NPP npp, NPObject* obj, const NPVariant *args, uint32_t argCount, NPVariant *result);
#define NewNPN_InvokeDefaultProc(FUNC)		\
		((NPN_InvokeDefaultUPP) (FUNC))
#define CallNPN_InvokeDefaultProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5))

/* NPN_Evaluate */
typedef bool (* NP_LOADDS NPN_EvaluateUPP)(NPP npp, NPObject *obj, NPString *script, NPVariant *result);
#define NewNPN_EvaluateProc(FUNC)		\
		((NPN_EvaluateUPP) (FUNC))
#define CallNPN_EvaluateProc(FUNC, ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPN_GetProperty */
typedef bool (* NP_LOADDS NPN_GetPropertyUPP)(NPP npp, NPObject *obj, NPIdentifier propertyName, NPVariant *result);
#define NewNPN_GetPropertyProc(FUNC)		\
		((NPN_GetPropertyUPP) (FUNC))
#define CallNPN_GetPropertyProc(FUNC, ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPN_SetProperty */
typedef bool (* NP_LOADDS NPN_SetPropertyUPP)(NPP npp, NPObject *obj, NPIdentifier propertyName, const NPVariant *value);
#define NewNPN_SetPropertyProc(FUNC)		\
		((NPN_SetPropertyUPP) (FUNC))
#define CallNPN_SetPropertyProc(FUNC, ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPN_RemoveProperty */
typedef bool (* NP_LOADDS NPN_RemovePropertyUPP)(NPP npp, NPObject *obj, NPIdentifier propertyName);
#define NewNPN_RemovePropertyProc(FUNC)		\
		((NPN_RemovePropertyUPP) (FUNC))
#define CallNPN_RemovePropertyProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_HasProperty */
typedef bool (* NP_LOADDS NPN_HasPropertyUPP)(NPP npp, NPObject *obj, NPIdentifier propertyName);
#define NewNPN_HasPropertyProc(FUNC)		\
		((NPN_HasPropertyUPP) (FUNC))
#define CallNPN_HasPropertyProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_HasMethod */
typedef bool (* NP_LOADDS NPN_HasMethodUPP)(NPP npp, NPObject *obj, NPIdentifier propertyName);
#define NewNPN_HasMethodProc(FUNC)		\
		((NPN_HasMethodUPP) (FUNC))
#define CallNPN_HasMethodProc(FUNC, ARG1, ARG2, ARG3)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_ReleaseVariantValue */
typedef void (* NP_LOADDS NPN_ReleaseVariantValueUPP)(NPVariant *variant);
#define NewNPN_ReleaseVariantValueProc(FUNC)		\
		((NPN_ReleaseVariantValueUPP) (FUNC))
#define CallNPN_ReleaseVariantValueProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_SetException */
typedef void (* NP_LOADDS NPN_SetExceptionUPP)(NPObject *obj, const NPUTF8 *message);
#define NewNPN_SetExceptionProc(FUNC)		\
		((NPN_SetExceptionUPP) (FUNC))
#define CallNPN_SetExceptionProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))	

/* NPN_PushPopupsEnabledStateUPP */
typedef bool (* NP_LOADDS NPN_PushPopupsEnabledStateUPP)(NPP npp, NPBool enabled);
#define NewNPN_PushPopupsEnabledStateProc(FUNC)		\
		((NPN_PushPopupsEnabledStateUPP) (FUNC))
#define CallNPN_PushPopupsEnabledStateProc(FUNC, ARG1, ARG2)		\
		(*(FUNC))((ARG1), (ARG2))

/* NPN_PopPopupsEnabledState */
typedef bool (* NP_LOADDS NPN_PopPopupsEnabledStateUPP)(NPP npp);
#define NewNPN_PopPopupsEnabledStateProc(FUNC)		\
		((NPN_PopPopupsEnabledStateUPP) (FUNC))
#define CallNPN_PopPopupsEnabledStateProc(FUNC, ARG1)		\
		(*(FUNC))((ARG1))

/* NPN_Enumerate */
typedef bool (* NP_LOADDS NPN_EnumerateUPP)(NPP npp, NPObject *obj, NPIdentifier **identifier, uint32_t *count);
#define NewNPN_EnumerateProc(FUNC)		\
		((NPN_EnumerateUPP) (FUNC))
#define CallNPN_EnumerateProc(FUNC, ARG1, ARG2, ARG3, ARG4)		\
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4))

/* NPN_PluginThreadAsyncCall */
typedef void (* NP_LOADDS NPN_PluginThreadAsyncCallUPP)(NPP instance, void (*func)(void *), void *userData);
#define NewNPN_PluginThreadAsyncCallProc(FUNC) \
		((NPN_PluginThreadAsyncCallUPP) (FUNC))
#define CallNPN_PluginThreadAsyncCallProc(FUNC, ARG1, ARG2, ARG3) \
		(*(FUNC))((ARG1), (ARG2), (ARG3))

/* NPN_Construct */
typedef bool (* NP_LOADDS NPN_ConstructUPP)(NPP npp, NPObject* obj, const NPVariant *args, uint32_t argCount, NPVariant *result);
#define NewNPN_ConstructProc(FUNC)		\
		((NPN_ConstructUPP) (FUNC))
#define CallNPN_ConstructProc(FUNC, ARG1, ARG2, ARG3, ARG4, ARG5)      \
		(*(FUNC))((ARG1), (ARG2), (ARG3), (ARG4), (ARG5))



/******************************************************************************************
 * The actual plugin function table definitions
 *******************************************************************************************/

typedef struct _NPPluginFuncs {
    uint16 size;
    uint16 version;
    NPP_NewUPP newp;
    NPP_DestroyUPP destroy;
    NPP_SetWindowUPP setwindow;
    NPP_NewStreamUPP newstream;
    NPP_DestroyStreamUPP destroystream;
    NPP_StreamAsFileUPP asfile;
    NPP_WriteReadyUPP writeready;
    NPP_WriteUPP write;
    NPP_PrintUPP print;
    NPP_HandleEventUPP event;
    NPP_URLNotifyUPP urlnotify;
    JRIGlobalRef javaClass;
    NPP_GetValueUPP getvalue;
    NPP_SetValueUPP setvalue;
} NPPluginFuncs;

typedef struct _NPNetscapeFuncs {
    uint16 size;
    uint16 version;
    NPN_GetURLUPP geturl;
    NPN_PostURLUPP posturl;
    NPN_RequestReadUPP requestread;
    NPN_NewStreamUPP newstream;
    NPN_WriteUPP write;
    NPN_DestroyStreamUPP destroystream;
    NPN_StatusUPP status;
    NPN_UserAgentUPP uagent;
    NPN_MemAllocUPP memalloc;
    NPN_MemFreeUPP memfree;
    NPN_MemFlushUPP memflush;
    NPN_ReloadPluginsUPP reloadplugins;
    NPN_GetJavaEnvUPP getJavaEnv;
    NPN_GetJavaPeerUPP getJavaPeer;
    NPN_GetURLNotifyUPP geturlnotify;
    NPN_PostURLNotifyUPP posturlnotify;
    NPN_GetValueUPP getvalue;
    NPN_SetValueUPP setvalue;
    NPN_InvalidateRectUPP invalidaterect;
    NPN_InvalidateRegionUPP invalidateregion;
    NPN_ForceRedrawUPP forceredraw;
    NPN_GetStringIdentifierUPP getstringidentifier;
    NPN_GetStringIdentifiersUPP getstringidentifiers;
    NPN_GetIntIdentifierUPP getintidentifier;
    NPN_IdentifierIsStringUPP identifierisstring;
    NPN_UTF8FromIdentifierUPP utf8fromidentifier;
    NPN_IntFromIdentifierUPP intfromidentifier;
    NPN_CreateObjectUPP createobject;
    NPN_RetainObjectUPP retainobject;
    NPN_ReleaseObjectUPP releaseobject;
    NPN_InvokeUPP invoke;
    NPN_InvokeDefaultUPP invokeDefault;
    NPN_EvaluateUPP evaluate;
    NPN_GetPropertyUPP getproperty;
    NPN_SetPropertyUPP setproperty;
    NPN_RemovePropertyUPP removeproperty;
    NPN_HasPropertyUPP hasproperty;
    NPN_HasMethodUPP hasmethod;
    NPN_ReleaseVariantValueUPP releasevariantvalue;
    NPN_SetExceptionUPP setexception;
    NPN_PushPopupsEnabledStateUPP pushpopupsenabledstate;
    NPN_PopPopupsEnabledStateUPP poppopupsenabledstate;
    NPN_EnumerateUPP enumerate;
    NPN_PluginThreadAsyncCallUPP pluginthreadasynccall;
    NPN_ConstructUPP construct;
} NPNetscapeFuncs;


#ifdef XP_MACOSX
/******************************************************************************************
 * Mac platform-specific plugin glue stuff
 *******************************************************************************************/

/*
 * Main entry point of the plugin.
 * This routine will be called when the plugin is loaded. The function
 * tables are passed in and the plugin fills in the NPPluginFuncs table
 * and NPPShutdownUPP for Netscape's use.
 */
typedef NPError (* NP_LOADDS NPP_MainEntryUPP)(NPNetscapeFuncs*, NPPluginFuncs*, NPP_ShutdownUPP*);
#define NewNPP_MainEntryProc(FUNC)		\
		((NPP_MainEntryUPP) (FUNC))
#define CallNPP_MainEntryProc(FUNC,  netscapeFunc, pluginFunc, shutdownUPP)		\
		(*(FUNC))((netscapeFunc), (pluginFunc), (shutdownUPP))

/*
 * Mac OS X version(s) of NP_GetMIMEDescription(const char *)
 * These can be called to retreive MIME information from the plugin dynamically
 *
 * Note: For compatibility with Quicktime, BPSupportedMIMEtypes is another way
 *       to get mime info from the plugin only on OSX and may not be supported 
 *       in furture version -- use NP_GetMIMEDescription instead
 */

enum
{
 kBPSupportedMIMETypesStructVers_1    = 1
};

typedef struct _BPSupportedMIMETypes
{
 SInt32    structVersion;      /* struct version */
 Handle    typeStrings;        /* STR# formated handle, allocated by plug-in */
 Handle    infoStrings;        /* STR# formated handle, allocated by plug-in */
} BPSupportedMIMETypes;
OSErr BP_GetSupportedMIMETypes(BPSupportedMIMETypes *mimeInfo, UInt32 flags);

 /* NP_GetMIMEDescription */
#define NP_GETMIMEDESCRIPTION_NAME "NP_GetMIMEDescription"
typedef const char* (* NP_LOADDS NP_GetMIMEDescriptionUPP)();
#define NewNP_GetMIMEDescEntryProc(FUNC)		\
		((NP_GetMIMEDescriptionUPP) (FUNC))
#define CallNP_GetMIMEDescEntryProc(FUNC)		\
		(*(FUNC))()

/* BP_GetSupportedMIMETypes */
typedef OSErr (* NP_LOADDS BP_GetSupportedMIMETypesUPP)(BPSupportedMIMETypes*, UInt32);
#define NewBP_GetSupportedMIMETypesEntryProc(FUNC)		\
		((BP_GetSupportedMIMETypesUPP) (FUNC))
#define CallBP_GetMIMEDescEntryProc(FUNC,  mimeInfo, flags)		\
		(*(FUNC))((mimeInfo), (flags))

#endif /* XP_MACOSX */

#if defined(_WINDOWS)
#define OSCALL WINAPI
#else
#if defined(__OS2__)
#define OSCALL _System
#else
#define OSCALL
#endif
#endif

#if defined(XP_UNIX)
/* GCC 3.3 and later support the visibility attribute. */
#if defined(__GNUC__) && \
    ((__GNUC__ >= 4) || (__GNUC__ == 3 && __GNUC_MINOR__ >= 3))
#define NP_VISIBILITY_DEFAULT __attribute__((visibility("default")))
#else
#define NP_VISIBILITY_DEFAULT
#endif

#define NP_EXPORT(__type) NP_VISIBILITY_DEFAULT __type
#endif

#if defined( _WINDOWS ) || defined (__OS2__)

#ifdef __cplusplus
extern "C" {
#endif

/* plugin meta member functions */
#if defined(__OS2__)

typedef struct _NPPluginData {   /* Alternate OS2 Plugin interface */
    char *pMimeTypes;
    char *pFileExtents;
    char *pFileOpenTemplate;
    char *pProductName;
    char *pProductDescription;
    unsigned long dwProductVersionMS;
    unsigned long dwProductVersionLS;
} NPPluginData;

NPError OSCALL NP_GetPluginData(NPPluginData * pPluginData);

#endif

NPError OSCALL NP_GetEntryPoints(NPPluginFuncs* pFuncs);

NPError OSCALL NP_Initialize(NPNetscapeFuncs* pFuncs);

NPError OSCALL NP_Shutdown();

char*	NP_GetMIMEDescription();

#ifdef __cplusplus
}
#endif

#endif /* _WINDOWS || __OS2__ */

#if defined(__OS2__)
#pragma pack()
#endif

#ifdef XP_UNIX

#ifdef __cplusplus
extern "C" {
#endif

/* plugin meta member functions */

NP_EXPORT(char*)   NP_GetMIMEDescription(void);
NP_EXPORT(NPError) NP_Initialize(NPNetscapeFuncs*, NPPluginFuncs*);
NP_EXPORT(NPError) NP_Shutdown(void);
NP_EXPORT(NPError) NP_GetValue(void *future, NPPVariable aVariable, void *aValue);

#ifdef __cplusplus
}
#endif

#endif /* XP_UNIX */

#endif /* _NPUPP_H_ */
