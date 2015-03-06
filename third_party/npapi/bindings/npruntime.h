/*
 * Copyright (C) 2004, Apple Computer, Inc. and The Mozilla Foundation. 
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 * 
 * 1. Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 * notice, this list of conditions and the following disclaimer in the
 * documentation and/or other materials provided with the distribution.
 * 3. Neither the names of Apple Computer, Inc. ("Apple") or The Mozilla
 * Foundation ("Mozilla") nor the names of their contributors may be used
 * to endorse or promote products derived from this software without
 * specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY APPLE, MOZILLA AND THEIR CONTRIBUTORS "AS
 * IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL APPLE, MOZILLA OR
 * THEIR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Revision 1 (March 4, 2004):
 * Initial proposal.
 *
 * Revision 2 (March 10, 2004):
 * All calls into script were made asynchronous.  Results are
 * provided via the NPScriptResultFunctionPtr callback.
 *
 * Revision 3 (March 10, 2004):
 * Corrected comments to not refer to class retain/release FunctionPtrs.
 *
 * Revision 4 (March 11, 2004):
 * Added additional convenience NPN_SetExceptionWithUTF8().
 * Changed NPHasPropertyFunctionPtr and NPHasMethodFunctionPtr to take NPClass
 * pointers instead of NPObject pointers.
 * Added NPIsValidIdentifier().
 *
 * Revision 5 (March 17, 2004):
 * Added context parameter to result callbacks from ScriptObject functions.
 *
 * Revision 6 (March 29, 2004):
 * Renamed functions implemented by user agent to NPN_*.  Removed _ from
 * type names.
 * Renamed "JavaScript" types to "Script".
 *
 * Revision 7 (April 21, 2004):
 * NPIdentifier becomes a void*, was int32_t
 * Remove NP_IsValidIdentifier, renamed NP_IdentifierFromUTF8 to NP_GetIdentifier
 * Added NPVariant and modified functions to use this new type.
 *
 * Revision 8 (July 9, 2004):
 * Updated to joint Apple-Mozilla license.
 *
 * Revision 9 (August 12, 2004):
 * Changed NPVariantType enum values to form PVariantType_XXX
 * Added NPP arguments to NPObject functions.
 * Replaced NPVariant functions with macros.
 */
#ifndef _NP_RUNTIME_H_
#define _NP_RUNTIME_H_


// BEGIN GOOGLE MODIFICATIONS

#include "base/basictypes.h"
#include "bindings/npapi.h"

typedef uint8 uint8_t;
typedef int8 int8_t;
typedef uint16 uint16_t;
typedef int16 int16_t;
typedef uint32 uint32_t;
typedef int32 int32_t;
typedef int64 int64_t;
typedef uint64 uint64_t;

// END GOOGLE MODIFICATIONS


#ifdef __cplusplus
extern "C" {
#endif

/*
    This API is used to facilitate binding code written in C to script
    objects.  The API in this header does not assume the presence of a
    user agent.  That is, it can be used to bind C code to scripting
    environments outside of the context of a user agent.
    
    However, the normal use of the this API is in the context of a
    scripting environment running in a browser or other user agent.
    In particular it is used to support the extended Netscape
    script-ability API for plugins (NP-SAP).  NP-SAP is an extension
    of the Netscape plugin API.  As such we have adopted the use of
    the "NP" prefix for this API.

    The following NP{N|P}Variables were added to the Netscape plugin
    API (in npapi.h):

    NPNVWindowNPObject
    NPNVPluginElementNPObject
    NPPVpluginScriptableNPObject

    These variables are exposed through NPN_GetValue() and
    NPP_GetValue() (respectively) and are used to establish the
    initial binding between the user agent and native code.  The DOM
    objects in the user agent can be examined and manipulated using
    the NPN_ functions that operate on NPObjects described in this
    header.

    To the extent possible the assumptions about the scripting
    language used by the scripting environment have been minimized.
*/


/*
    Objects (non-primitive data) passed between 'C' and script is
    always wrapped in an NPObject.  The 'interface' of an NPObject is
    described by an NPClass.
*/
typedef struct NPObject NPObject;
typedef struct NPClass NPClass;

typedef char NPUTF8;
typedef struct _NPString {
    const NPUTF8 *UTF8Characters;
    uint32_t UTF8Length;
} NPString;
  
typedef enum {
    NPVariantType_Void,
    NPVariantType_Null,
    NPVariantType_Bool,
    NPVariantType_Int32,
    NPVariantType_Double,
    NPVariantType_String,
    NPVariantType_Object
} NPVariantType;

typedef struct _NPVariant {
    NPVariantType type;
    union {
        bool boolValue;
        int32_t intValue;
        double doubleValue;
        NPString stringValue;
        NPObject *objectValue;
    } value;
} NPVariant;

/*
    NPN_ReleaseVariantValue is called on all 'out' parameters references.
    Specifically it is called on variants that are resultant out parameters
    in NPGetPropertyFunctionPtr and NPInvokeFunctionPtr.  Resultant variants
    from these two functions should be initialized using the
    NPN_InitializeVariantXXX() functions.
    
    After calling NPReleaseVariantValue, the type of the variant will
    be set to NPVariantUndefinedType.
*/
void NPN_ReleaseVariantValue (NPVariant *variant);

#define NPVARIANT_IS_VOID(_v)    ((_v).type == NPVariantType_Void)
#define NPVARIANT_IS_NULL(_v)    ((_v).type == NPVariantType_Null)
#define NPVARIANT_IS_BOOLEAN(_v) ((_v).type == NPVariantType_Bool)
#define NPVARIANT_IS_INT32(_v)   ((_v).type == NPVariantType_Int32)
#define NPVARIANT_IS_DOUBLE(_v)  ((_v).type == NPVariantType_Double)
#define NPVARIANT_IS_STRING(_v)  ((_v).type == NPVariantType_String)
#define NPVARIANT_IS_OBJECT(_v)  ((_v).type == NPVariantType_Object)

#define NPVARIANT_TO_BOOLEAN(_v) ((_v).value.boolValue)
#define NPVARIANT_TO_INT32(_v)   ((_v).value.intValue)
#define NPVARIANT_TO_DOUBLE(_v)  ((_v).value.doubleValue)
#define NPVARIANT_TO_STRING(_v)  ((_v).value.stringValue)
#define NPVARIANT_TO_OBJECT(_v)  ((_v).value.objectValue)

#define NP_BEGIN_MACRO  do {
#define NP_END_MACRO    } while (0)

#define VOID_TO_NPVARIANT(_v)                NP_BEGIN_MACRO (_v).type = NPVariantType_Void; (_v).value.objectValue = NULL; NP_END_MACRO
#define NULL_TO_NPVARIANT(_v)                NP_BEGIN_MACRO (_v).type = NPVariantType_Null; (_v).value.objectValue = NULL; NP_END_MACRO
#define BOOLEAN_TO_NPVARIANT(_val, _v)       NP_BEGIN_MACRO (_v).type = NPVariantType_Bool; (_v).value.boolValue = !!(_val); NP_END_MACRO
#define INT32_TO_NPVARIANT(_val, _v)         NP_BEGIN_MACRO (_v).type = NPVariantType_Int32; (_v).value.intValue = _val; NP_END_MACRO
#define DOUBLE_TO_NPVARIANT(_val, _v)        NP_BEGIN_MACRO (_v).type = NPVariantType_Double; (_v).value.doubleValue = _val; NP_END_MACRO
#define STRINGZ_TO_NPVARIANT(_val, _v)       NP_BEGIN_MACRO (_v).type = NPVariantType_String; NPString str = { _val, strlen(_val) }; (_v).value.stringValue = str; NP_END_MACRO
#define STRINGN_TO_NPVARIANT(_val, _len, _v) NP_BEGIN_MACRO (_v).type = NPVariantType_String; NPString str = { _val, _len }; (_v).value.stringValue = str; NP_END_MACRO
#define OBJECT_TO_NPVARIANT(_val, _v)        NP_BEGIN_MACRO (_v).type = NPVariantType_Object; (_v).value.objectValue = _val; NP_END_MACRO

/*
        Type mappings (JavaScript types have been used for illustration
    purposes):

        JavaScript       to             C (NPVariant with type:)
        undefined                       NPVariantType_Void
        null                            NPVariantType_Null
        Boolean                         NPVariantType_Bool
        Number                          NPVariantType_Double or NPVariantType_Int32
        String                          NPVariantType_String
        Object                          NPVariantType_Object

        C (NPVariant with type:)   to   JavaScript
        NPVariantType_Void              undefined
        NPVariantType_Null              null
        NPVariantType_Bool              Boolean 
        NPVariantType_Int32             Number
        NPVariantType_Double            Number
        NPVariantType_String            String
        NPVariantType_Object            Object
*/

typedef void *NPIdentifier;

/*
    NPObjects have methods and properties.  Methods and properties are
    identified with NPIdentifiers.  These identifiers may be reflected
    in script.  NPIdentifiers can be either strings or integers, IOW,
    methods and properties can be identified by either strings or
    integers (i.e. foo["bar"] vs foo[1]). NPIdentifiers can be
    compared using ==.  In case of any errors, the requested
    NPIdentifier(s) will be NULL.
*/
NPIdentifier NPN_GetStringIdentifier(const NPUTF8 *name);
void NPN_GetStringIdentifiers(const NPUTF8 **names, int32_t nameCount, NPIdentifier *identifiers);
NPIdentifier NPN_GetIntIdentifier(int32_t intid);
bool NPN_IdentifierIsString(NPIdentifier identifier);

/*
    The NPUTF8 returned from NPN_UTF8FromIdentifier SHOULD be freed.
*/
NPUTF8 *NPN_UTF8FromIdentifier(NPIdentifier identifier);

/*
    Get the integer represented by identifier. If identifier is not an
    integer identifier, the behaviour is undefined.
*/
int32_t NPN_IntFromIdentifier(NPIdentifier identifier);

/*
    NPObject behavior is implemented using the following set of
    callback functions.

    The NPVariant *result argument of these functions (where
    applicable) should be released using NPN_ReleaseVariantValue().
*/
typedef NPObject *(*NPAllocateFunctionPtr)(NPP npp, NPClass *aClass);
typedef void (*NPDeallocateFunctionPtr)(NPObject *obj);
typedef void (*NPInvalidateFunctionPtr)(NPObject *obj);
typedef bool (*NPHasMethodFunctionPtr)(NPObject *obj, NPIdentifier name);
typedef bool (*NPInvokeFunctionPtr)(NPObject *obj, NPIdentifier name, const NPVariant *args, uint32_t argCount, NPVariant *result);
typedef bool (*NPInvokeDefaultFunctionPtr)(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result);
typedef bool (*NPHasPropertyFunctionPtr)(NPObject *obj, NPIdentifier name);
typedef bool (*NPGetPropertyFunctionPtr)(NPObject *obj, NPIdentifier name, NPVariant *result);
typedef bool (*NPSetPropertyFunctionPtr)(NPObject *obj, NPIdentifier name, const NPVariant *value);
typedef bool (*NPRemovePropertyFunctionPtr)(NPObject *npobj, NPIdentifier name);
typedef bool (*NPEnumerationFunctionPtr)(NPObject *npobj, NPIdentifier **value, uint32_t *count);
typedef bool (*NPConstructFunctionPtr)(NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result);

/*
    NPObjects returned by create have a reference count of one.  It is the caller's responsibility
    to release the returned object.

    NPInvokeFunctionPtr function may return false to indicate a the method could not be invoked.
    
    NPGetPropertyFunctionPtr and NPSetPropertyFunctionPtr may return false to indicate a property doesn't
    exist.
    
    NPInvalidateFunctionPtr is called by the scripting environment when the native code is
    shutdown.  Any attempt to message a NPObject instance after the invalidate
    callback has been called will result in undefined behavior, even if the
    native code is still retaining those NPObject instances.
    (The runtime will typically return immediately, with 0 or NULL, from an attempt to
    dispatch to a NPObject, but this behavior should not be depended upon.)
    
    The NPEnumerationFunctionPtr function may pass an array of                  
    NPIdentifiers back to the caller. The callee allocs the memory of           
    the array using NPN_MemAlloc(), and it's the caller's responsibility        
    to release it using NPN_MemFree().           
*/
struct NPClass
{
    uint32_t structVersion;
    NPAllocateFunctionPtr allocate;
    NPDeallocateFunctionPtr deallocate;
    NPInvalidateFunctionPtr invalidate;
    NPHasMethodFunctionPtr hasMethod;
    NPInvokeFunctionPtr invoke;
    NPInvokeDefaultFunctionPtr invokeDefault;
    NPHasPropertyFunctionPtr hasProperty;
    NPGetPropertyFunctionPtr getProperty;
    NPSetPropertyFunctionPtr setProperty;
    NPRemovePropertyFunctionPtr removeProperty;
    NPEnumerationFunctionPtr enumerate;
    NPConstructFunctionPtr construct;
};

#define NP_CLASS_STRUCT_VERSION      3
#define NP_CLASS_STRUCT_VERSION_ENUM 2
#define NP_CLASS_STRUCT_VERSION_CTOR 3

#define NP_CLASS_STRUCT_VERSION_HAS_ENUM(npclass)   \
    ((npclass)->structVersion >= NP_CLASS_STRUCT_VERSION_ENUM)
#define NP_CLASS_STRUCT_VERSION_HAS_CTOR(npclass)   \
    ((npclass)->structVersion >= NP_CLASS_STRUCT_VERSION_CTOR)

struct NPObject {
    NPClass *_class;
    uint32_t referenceCount;
    // Additional space may be allocated here by types of NPObjects
};

/*
    If the class has an allocate function, NPN_CreateObject invokes that function,
    otherwise a NPObject is allocated and returned.  If a class has an allocate
    function it is the responsibility of that implementation to set the initial retain
    count to 1.
*/
NPObject *NPN_CreateObject(NPP npp, NPClass *aClass);

/*
    Increment the NPObject's reference count.
*/
NPObject *NPN_RetainObject (NPObject *obj);

/*
    Decremented the NPObject's reference count.  If the reference
    count goes to zero, the class's destroy function is invoke if
    specified, otherwise the object is freed directly.
*/
void NPN_ReleaseObject (NPObject *obj);

/*
    Functions to access script objects represented by NPObject.

    Calls to script objects are synchronous.  If a function returns a
    value, it will be supplied via the result NPVariant
    argument. Successful calls will return true, false will be
    returned in case of an error.
    
    Calls made from plugin code to script must be made from the thread
    on which the plugin was initialized.
*/
bool NPN_Invoke(NPP npp, NPObject *npobj, NPIdentifier methodName, const NPVariant *args, uint32_t argCount, NPVariant *result);
bool NPN_InvokeDefault(NPP npp, NPObject *npobj, const NPVariant *args, uint32_t argCount, NPVariant *result);
bool NPN_Evaluate(NPP npp, NPObject *npobj, NPString *script, NPVariant *result);
bool NPN_GetProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName, NPVariant *result);
bool NPN_SetProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName, const NPVariant *value);
bool NPN_RemoveProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName);
bool NPN_HasProperty(NPP npp, NPObject *npobj, NPIdentifier propertyName);
bool NPN_HasMethod(NPP npp, NPObject *npobj, NPIdentifier methodName);
bool NPN_Enumerate(NPP npp, NPObject *npobj, NPIdentifier **identifier, uint32_t *count);
bool NPN_Construct(NPP npp, NPObject* obj, const NPVariant *args, uint32_t argCount, NPVariant *result);

// Helper function for evaluating a script in the scope of the NPObject passed in.
// Parameters
// npp
//  The plugin's opaque instance handle (Can be NULL)
// popups_allowed
//  Indicates if popups created in the context of the script being executed are
//  blocked or not.
// npobj
//  The NPObject.
// npscript
//  The script being executed.
// result
//  On return contains the value returned by the script.
// Returns true on success.
bool NPN_EvaluateHelper(NPP npp, bool popups_allowed, NPObject* npobj, 
                        NPString* npscript, NPVariant *result);

// BEGIN GOOGLE MODIFICATIONS

void* NPP_GetJavaClass(void);
void* NPN_GetJavaEnv(void);
void* NPN_GetJavaPeer(NPP instance);
void NPN_PluginThreadAsyncCall(NPP id, void (*func)(void *), void *userData);

// END GOOGLE MODIFICATIONS

/*
    NPN_SetException may be called to trigger a script exception upon return
    from entry points into NPObjects.
*/
void NPN_SetException (NPObject *obj, const NPUTF8 *message);

#ifdef __cplusplus
}
#endif

#endif
