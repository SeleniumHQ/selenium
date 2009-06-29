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

/*******************************************************************************
 * Java Runtime Interface
 ******************************************************************************/

#ifndef JRI_H
#define JRI_H

#include "jritypes.h"

#ifdef __cplusplus
extern "C" {
#endif /* __cplusplus */

/*******************************************************************************
 * JRIEnv
 ******************************************************************************/

/* The type of the JRIEnv interface. */
typedef struct JRIEnvInterface	JRIEnvInterface;

/* The type of a JRIEnv instance. */
typedef const JRIEnvInterface*	JRIEnv;

/*******************************************************************************
 * JRIEnv Operations
 ******************************************************************************/

#define JRI_DefineClass(env, classLoader, buf, bufLen)	\
	(((*(env))->DefineClass)(env, JRI_DefineClass_op, classLoader, buf, bufLen))

#define JRI_FindClass(env, name)	\
	(((*(env))->FindClass)(env, JRI_FindClass_op, name))

#define JRI_Throw(env, obj)	\
	(((*(env))->Throw)(env, JRI_Throw_op, obj))

#define JRI_ThrowNew(env, clazz, message)	\
	(((*(env))->ThrowNew)(env, JRI_ThrowNew_op, clazz, message))

#define JRI_ExceptionOccurred(env)	\
	(((*(env))->ExceptionOccurred)(env, JRI_ExceptionOccurred_op))

#define JRI_ExceptionDescribe(env)	\
	(((*(env))->ExceptionDescribe)(env, JRI_ExceptionDescribe_op))

#define JRI_ExceptionClear(env)	\
	(((*(env))->ExceptionClear)(env, JRI_ExceptionClear_op))

#define JRI_NewGlobalRef(env, ref)	\
	(((*(env))->NewGlobalRef)(env, JRI_NewGlobalRef_op, ref))

#define JRI_DisposeGlobalRef(env, gref)	\
	(((*(env))->DisposeGlobalRef)(env, JRI_DisposeGlobalRef_op, gref))

#define JRI_GetGlobalRef(env, gref)	\
	(((*(env))->GetGlobalRef)(env, JRI_GetGlobalRef_op, gref))

#define JRI_SetGlobalRef(env, gref, ref)	\
	(((*(env))->SetGlobalRef)(env, JRI_SetGlobalRef_op, gref, ref))

#define JRI_IsSameObject(env, a, b)	\
	(((*(env))->IsSameObject)(env, JRI_IsSameObject_op, a, b))

#define JRI_NewObject(env)	((*(env))->NewObject)
#define JRI_NewObjectV(env, clazz, methodID, args)	\
	(((*(env))->NewObjectV)(env, JRI_NewObject_op_va_list, clazz, methodID, args))
#define JRI_NewObjectA(env, clazz, method, args)	\
	(((*(env))->NewObjectA)(env, JRI_NewObject_op_array, clazz, methodID, args))

#define JRI_GetObjectClass(env, obj)	\
	(((*(env))->GetObjectClass)(env, JRI_GetObjectClass_op, obj))

#define JRI_IsInstanceOf(env, obj, clazz)	\
	(((*(env))->IsInstanceOf)(env, JRI_IsInstanceOf_op, obj, clazz))

#define JRI_GetMethodID(env, clazz, name, sig)	\
	(((*(env))->GetMethodID)(env, JRI_GetMethodID_op, clazz, name, sig))

#define JRI_CallMethod(env)	((*(env))->CallMethod)
#define JRI_CallMethodV(env, obj, methodID, args)	\
	(((*(env))->CallMethodV)(env, JRI_CallMethod_op_va_list, obj, methodID, args))
#define JRI_CallMethodA(env, obj, methodID, args)	\
	(((*(env))->CallMethodA)(env, JRI_CallMethod_op_array, obj, methodID, args))

#define JRI_CallMethodBoolean(env)	((*(env))->CallMethodBoolean)
#define JRI_CallMethodBooleanV(env, obj, methodID, args)	\
	(((*(env))->CallMethodBooleanV)(env, JRI_CallMethodBoolean_op_va_list, obj, methodID, args))
#define JRI_CallMethodBooleanA(env, obj, methodID, args)	\
	(((*(env))->CallMethodBooleanA)(env, JRI_CallMethodBoolean_op_array, obj, methodID, args))

#define JRI_CallMethodByte(env)	((*(env))->CallMethodByte)
#define JRI_CallMethodByteV(env, obj, methodID, args)	\
	(((*(env))->CallMethodByteV)(env, JRI_CallMethodByte_op_va_list, obj, methodID, args))
#define JRI_CallMethodByteA(env, obj, methodID, args)	\
	(((*(env))->CallMethodByteA)(env, JRI_CallMethodByte_op_array, obj, methodID, args))

#define JRI_CallMethodChar(env)	((*(env))->CallMethodChar)
#define JRI_CallMethodCharV(env, obj, methodID, args)	\
	(((*(env))->CallMethodCharV)(env, JRI_CallMethodChar_op_va_list, obj, methodID, args))
#define JRI_CallMethodCharA(env, obj, methodID, args)	\
	(((*(env))->CallMethodCharA)(env, JRI_CallMethodChar_op_array, obj, methodID, args))

#define JRI_CallMethodShort(env)	((*(env))->CallMethodShort)
#define JRI_CallMethodShortV(env, obj, methodID, args)	\
	(((*(env))->CallMethodShortV)(env, JRI_CallMethodShort_op_va_list, obj, methodID, args))
#define JRI_CallMethodShortA(env, obj, methodID, args)	\
	(((*(env))->CallMethodShortA)(env, JRI_CallMethodShort_op_array, obj, methodID, args))

#define JRI_CallMethodInt(env)	((*(env))->CallMethodInt)
#define JRI_CallMethodIntV(env, obj, methodID, args)	\
	(((*(env))->CallMethodIntV)(env, JRI_CallMethodInt_op_va_list, obj, methodID, args))
#define JRI_CallMethodIntA(env, obj, methodID, args)	\
	(((*(env))->CallMethodIntA)(env, JRI_CallMethodInt_op_array, obj, methodID, args))

#define JRI_CallMethodLong(env)	((*(env))->CallMethodLong)
#define JRI_CallMethodLongV(env, obj, methodID, args)	\
	(((*(env))->CallMethodLongV)(env, JRI_CallMethodLong_op_va_list, obj, methodID, args))
#define JRI_CallMethodLongA(env, obj, methodID, args)	\
	(((*(env))->CallMethodLongA)(env, JRI_CallMethodLong_op_array, obj, methodID, args))

#define JRI_CallMethodFloat(env)	((*(env))->CallMethodFloat)
#define JRI_CallMethodFloatV(env, obj, methodID, args)	\
	(((*(env))->CallMethodFloatV)(env, JRI_CallMethodFloat_op_va_list, obj, methodID, args))
#define JRI_CallMethodFloatA(env, obj, methodID, args)	\
	(((*(env))->CallMethodFloatA)(env, JRI_CallMethodFloat_op_array, obj, methodID, args))

#define JRI_CallMethodDouble(env)	((*(env))->CallMethodDouble)
#define JRI_CallMethodDoubleV(env, obj, methodID, args)	\
	(((*(env))->CallMethodDoubleV)(env, JRI_CallMethodDouble_op_va_list, obj, methodID, args))
#define JRI_CallMethodDoubleA(env, obj, methodID, args)	\
	(((*(env))->CallMethodDoubleA)(env, JRI_CallMethodDouble_op_array, obj, methodID, args))

#define JRI_GetFieldID(env, clazz, name, sig)	\
	(((*(env))->GetFieldID)(env, JRI_GetFieldID_op, clazz, name, sig))

#define JRI_GetField(env, obj, fieldID)	\
	(((*(env))->GetField)(env, JRI_GetField_op, obj, fieldID))

#define JRI_GetFieldBoolean(env, obj, fieldID)	\
	(((*(env))->GetFieldBoolean)(env, JRI_GetFieldBoolean_op, obj, fieldID))

#define JRI_GetFieldByte(env, obj, fieldID)	\
	(((*(env))->GetFieldByte)(env, JRI_GetFieldByte_op, obj, fieldID))

#define JRI_GetFieldChar(env, obj, fieldID)	\
	(((*(env))->GetFieldChar)(env, JRI_GetFieldChar_op, obj, fieldID))

#define JRI_GetFieldShort(env, obj, fieldID)	\
	(((*(env))->GetFieldShort)(env, JRI_GetFieldShort_op, obj, fieldID))

#define JRI_GetFieldInt(env, obj, fieldID)	\
	(((*(env))->GetFieldInt)(env, JRI_GetFieldInt_op, obj, fieldID))

#define JRI_GetFieldLong(env, obj, fieldID)	\
	(((*(env))->GetFieldLong)(env, JRI_GetFieldLong_op, obj, fieldID))

#define JRI_GetFieldFloat(env, obj, fieldID)	\
	(((*(env))->GetFieldFloat)(env, JRI_GetFieldFloat_op, obj, fieldID))

#define JRI_GetFieldDouble(env, obj, fieldID)	\
	(((*(env))->GetFieldDouble)(env, JRI_GetFieldDouble_op, obj, fieldID))

#define JRI_SetField(env, obj, fieldID, value)	\
	(((*(env))->SetField)(env, JRI_SetField_op, obj, fieldID, value))

#define JRI_SetFieldBoolean(env, obj, fieldID, value)	\
	(((*(env))->SetFieldBoolean)(env, JRI_SetFieldBoolean_op, obj, fieldID, value))

#define JRI_SetFieldByte(env, obj, fieldID, value)	\
	(((*(env))->SetFieldByte)(env, JRI_SetFieldByte_op, obj, fieldID, value))

#define JRI_SetFieldChar(env, obj, fieldID, value)	\
	(((*(env))->SetFieldChar)(env, JRI_SetFieldChar_op, obj, fieldID, value))

#define JRI_SetFieldShort(env, obj, fieldID, value)	\
	(((*(env))->SetFieldShort)(env, JRI_SetFieldShort_op, obj, fieldID, value))

#define JRI_SetFieldInt(env, obj, fieldID, value)	\
	(((*(env))->SetFieldInt)(env, JRI_SetFieldInt_op, obj, fieldID, value))

#define JRI_SetFieldLong(env, obj, fieldID, value)	\
	(((*(env))->SetFieldLong)(env, JRI_SetFieldLong_op, obj, fieldID, value))

#define JRI_SetFieldFloat(env, obj, fieldID, value)	\
	(((*(env))->SetFieldFloat)(env, JRI_SetFieldFloat_op, obj, fieldID, value))

#define JRI_SetFieldDouble(env, obj, fieldID, value)	\
	(((*(env))->SetFieldDouble)(env, JRI_SetFieldDouble_op, obj, fieldID, value))

#define JRI_IsSubclassOf(env, a, b)	\
	(((*(env))->IsSubclassOf)(env, JRI_IsSubclassOf_op, a, b))

#define JRI_GetStaticMethodID(env, clazz, name, sig)	\
	(((*(env))->GetStaticMethodID)(env, JRI_GetStaticMethodID_op, clazz, name, sig))

#define JRI_CallStaticMethod(env)	((*(env))->CallStaticMethod)
#define JRI_CallStaticMethodV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodV)(env, JRI_CallStaticMethod_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodA)(env, JRI_CallStaticMethod_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodBoolean(env)	((*(env))->CallStaticMethodBoolean)
#define JRI_CallStaticMethodBooleanV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodBooleanV)(env, JRI_CallStaticMethodBoolean_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodBooleanA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodBooleanA)(env, JRI_CallStaticMethodBoolean_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodByte(env)	((*(env))->CallStaticMethodByte)
#define JRI_CallStaticMethodByteV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodByteV)(env, JRI_CallStaticMethodByte_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodByteA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodByteA)(env, JRI_CallStaticMethodByte_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodChar(env)	((*(env))->CallStaticMethodChar)
#define JRI_CallStaticMethodCharV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodCharV)(env, JRI_CallStaticMethodChar_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodCharA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodCharA)(env, JRI_CallStaticMethodChar_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodShort(env)	((*(env))->CallStaticMethodShort)
#define JRI_CallStaticMethodShortV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodShortV)(env, JRI_CallStaticMethodShort_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodShortA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodShortA)(env, JRI_CallStaticMethodShort_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodInt(env)	((*(env))->CallStaticMethodInt)
#define JRI_CallStaticMethodIntV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodIntV)(env, JRI_CallStaticMethodInt_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodIntA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodIntA)(env, JRI_CallStaticMethodInt_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodLong(env)	((*(env))->CallStaticMethodLong)
#define JRI_CallStaticMethodLongV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodLongV)(env, JRI_CallStaticMethodLong_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodLongA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodLongA)(env, JRI_CallStaticMethodLong_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodFloat(env)	((*(env))->CallStaticMethodFloat)
#define JRI_CallStaticMethodFloatV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodFloatV)(env, JRI_CallStaticMethodFloat_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodFloatA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodFloatA)(env, JRI_CallStaticMethodFloat_op_array, clazz, methodID, args))

#define JRI_CallStaticMethodDouble(env)	((*(env))->CallStaticMethodDouble)
#define JRI_CallStaticMethodDoubleV(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodDoubleV)(env, JRI_CallStaticMethodDouble_op_va_list, clazz, methodID, args))
#define JRI_CallStaticMethodDoubleA(env, clazz, methodID, args)	\
	(((*(env))->CallStaticMethodDoubleA)(env, JRI_CallStaticMethodDouble_op_array, clazz, methodID, args))

#define JRI_GetStaticFieldID(env, clazz, name, sig)	\
	(((*(env))->GetStaticFieldID)(env, JRI_GetStaticFieldID_op, clazz, name, sig))

#define JRI_GetStaticField(env, clazz, fieldID)	\
	(((*(env))->GetStaticField)(env, JRI_GetStaticField_op, clazz, fieldID))

#define JRI_GetStaticFieldBoolean(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldBoolean)(env, JRI_GetStaticFieldBoolean_op, clazz, fieldID))

#define JRI_GetStaticFieldByte(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldByte)(env, JRI_GetStaticFieldByte_op, clazz, fieldID))

#define JRI_GetStaticFieldChar(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldChar)(env, JRI_GetStaticFieldChar_op, clazz, fieldID))

#define JRI_GetStaticFieldShort(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldShort)(env, JRI_GetStaticFieldShort_op, clazz, fieldID))

#define JRI_GetStaticFieldInt(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldInt)(env, JRI_GetStaticFieldInt_op, clazz, fieldID))

#define JRI_GetStaticFieldLong(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldLong)(env, JRI_GetStaticFieldLong_op, clazz, fieldID))

#define JRI_GetStaticFieldFloat(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldFloat)(env, JRI_GetStaticFieldFloat_op, clazz, fieldID))

#define JRI_GetStaticFieldDouble(env, clazz, fieldID)	\
	(((*(env))->GetStaticFieldDouble)(env, JRI_GetStaticFieldDouble_op, clazz, fieldID))

#define JRI_SetStaticField(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticField)(env, JRI_SetStaticField_op, clazz, fieldID, value))

#define JRI_SetStaticFieldBoolean(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldBoolean)(env, JRI_SetStaticFieldBoolean_op, clazz, fieldID, value))

#define JRI_SetStaticFieldByte(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldByte)(env, JRI_SetStaticFieldByte_op, clazz, fieldID, value))

#define JRI_SetStaticFieldChar(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldChar)(env, JRI_SetStaticFieldChar_op, clazz, fieldID, value))

#define JRI_SetStaticFieldShort(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldShort)(env, JRI_SetStaticFieldShort_op, clazz, fieldID, value))

#define JRI_SetStaticFieldInt(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldInt)(env, JRI_SetStaticFieldInt_op, clazz, fieldID, value))

#define JRI_SetStaticFieldLong(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldLong)(env, JRI_SetStaticFieldLong_op, clazz, fieldID, value))

#define JRI_SetStaticFieldFloat(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldFloat)(env, JRI_SetStaticFieldFloat_op, clazz, fieldID, value))

#define JRI_SetStaticFieldDouble(env, clazz, fieldID, value)	\
	(((*(env))->SetStaticFieldDouble)(env, JRI_SetStaticFieldDouble_op, clazz, fieldID, value))

#define JRI_NewString(env, unicode, len)	\
	(((*(env))->NewString)(env, JRI_NewString_op, unicode, len))

#define JRI_GetStringLength(env, string)	\
	(((*(env))->GetStringLength)(env, JRI_GetStringLength_op, string))

#define JRI_GetStringChars(env, string)	\
	(((*(env))->GetStringChars)(env, JRI_GetStringChars_op, string))

#define JRI_NewStringUTF(env, utf, len)	\
	(((*(env))->NewStringUTF)(env, JRI_NewStringUTF_op, utf, len))

#define JRI_GetStringUTFLength(env, string)	\
	(((*(env))->GetStringUTFLength)(env, JRI_GetStringUTFLength_op, string))

#define JRI_GetStringUTFChars(env, string)	\
	(((*(env))->GetStringUTFChars)(env, JRI_GetStringUTFChars_op, string))

#define JRI_NewScalarArray(env, length, elementSig, initialElements)	\
	(((*(env))->NewScalarArray)(env, JRI_NewScalarArray_op, length, elementSig, initialElements))

#define JRI_GetScalarArrayLength(env, array)	\
	(((*(env))->GetScalarArrayLength)(env, JRI_GetScalarArrayLength_op, array))

#define JRI_GetScalarArrayElements(env, array)	\
	(((*(env))->GetScalarArrayElements)(env, JRI_GetScalarArrayElements_op, array))

#define JRI_NewObjectArray(env, length, elementClass, initialElement)	\
	(((*(env))->NewObjectArray)(env, JRI_NewObjectArray_op, length, elementClass, initialElement))

#define JRI_GetObjectArrayLength(env, array)	\
	(((*(env))->GetObjectArrayLength)(env, JRI_GetObjectArrayLength_op, array))

#define JRI_GetObjectArrayElement(env, array, index)	\
	(((*(env))->GetObjectArrayElement)(env, JRI_GetObjectArrayElement_op, array, index))

#define JRI_SetObjectArrayElement(env, array, index, value)	\
	(((*(env))->SetObjectArrayElement)(env, JRI_SetObjectArrayElement_op, array, index, value))

#define JRI_RegisterNatives(env, clazz, nameAndSigArray, nativeProcArray)	\
	(((*(env))->RegisterNatives)(env, JRI_RegisterNatives_op, clazz, nameAndSigArray, nativeProcArray))

#define JRI_UnregisterNatives(env, clazz)	\
	(((*(env))->UnregisterNatives)(env, JRI_UnregisterNatives_op, clazz))

#define JRI_NewStringPlatform(env, string, len, encoding, encodingLength)	\
	(((*(env))->NewStringPlatform)(env, JRI_NewStringPlatform_op, string, len, encoding, encodingLength))

#define JRI_GetStringPlatformChars(env, string, encoding, encodingLength)	\
	(((*(env))->GetStringPlatformChars)(env, JRI_GetStringPlatformChars_op, string, encoding, encodingLength))


/*******************************************************************************
 * JRIEnv Interface
 ******************************************************************************/

struct java_lang_ClassLoader;
struct java_lang_Class;
struct java_lang_Throwable;
struct java_lang_Object;
struct java_lang_String;

struct JRIEnvInterface {
	void*	reserved0;
	void*	reserved1;
	void*	reserved2;
	void*	reserved3;
	struct java_lang_Class*	(*FindClass)(JRIEnv* env, jint op, const char* a);
	void	(*Throw)(JRIEnv* env, jint op, struct java_lang_Throwable* a);
	void	(*ThrowNew)(JRIEnv* env, jint op, struct java_lang_Class* a, const char* b);
	struct java_lang_Throwable*	(*ExceptionOccurred)(JRIEnv* env, jint op);
	void	(*ExceptionDescribe)(JRIEnv* env, jint op);
	void	(*ExceptionClear)(JRIEnv* env, jint op);
	jglobal	(*NewGlobalRef)(JRIEnv* env, jint op, void* a);
	void	(*DisposeGlobalRef)(JRIEnv* env, jint op, jglobal a);
	void*	(*GetGlobalRef)(JRIEnv* env, jint op, jglobal a);
	void	(*SetGlobalRef)(JRIEnv* env, jint op, jglobal a, void* b);
	jbool	(*IsSameObject)(JRIEnv* env, jint op, void* a, void* b);
	void*	(*NewObject)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	void*	(*NewObjectV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	void*	(*NewObjectA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	struct java_lang_Class*	(*GetObjectClass)(JRIEnv* env, jint op, void* a);
	jbool	(*IsInstanceOf)(JRIEnv* env, jint op, void* a, struct java_lang_Class* b);
	jint	(*GetMethodID)(JRIEnv* env, jint op, struct java_lang_Class* a, const char* b, const char* c);
	void*	(*CallMethod)(JRIEnv* env, jint op, void* a, jint b, ...);
	void*	(*CallMethodV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	void*	(*CallMethodA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jbool	(*CallMethodBoolean)(JRIEnv* env, jint op, void* a, jint b, ...);
	jbool	(*CallMethodBooleanV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jbool	(*CallMethodBooleanA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jbyte	(*CallMethodByte)(JRIEnv* env, jint op, void* a, jint b, ...);
	jbyte	(*CallMethodByteV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jbyte	(*CallMethodByteA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jchar	(*CallMethodChar)(JRIEnv* env, jint op, void* a, jint b, ...);
	jchar	(*CallMethodCharV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jchar	(*CallMethodCharA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jshort	(*CallMethodShort)(JRIEnv* env, jint op, void* a, jint b, ...);
	jshort	(*CallMethodShortV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jshort	(*CallMethodShortA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jint	(*CallMethodInt)(JRIEnv* env, jint op, void* a, jint b, ...);
	jint	(*CallMethodIntV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jint	(*CallMethodIntA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jlong	(*CallMethodLong)(JRIEnv* env, jint op, void* a, jint b, ...);
	jlong	(*CallMethodLongV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jlong	(*CallMethodLongA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jfloat	(*CallMethodFloat)(JRIEnv* env, jint op, void* a, jint b, ...);
	jfloat	(*CallMethodFloatV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jfloat	(*CallMethodFloatA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jdouble	(*CallMethodDouble)(JRIEnv* env, jint op, void* a, jint b, ...);
	jdouble	(*CallMethodDoubleV)(JRIEnv* env, jint op, void* a, jint b, va_list c);
	jdouble	(*CallMethodDoubleA)(JRIEnv* env, jint op, void* a, jint b, JRIValue* c);
	jint	(*GetFieldID)(JRIEnv* env, jint op, struct java_lang_Class* a, const char* b, const char* c);
	void*	(*GetField)(JRIEnv* env, jint op, void* a, jint b);
	jbool	(*GetFieldBoolean)(JRIEnv* env, jint op, void* a, jint b);
	jbyte	(*GetFieldByte)(JRIEnv* env, jint op, void* a, jint b);
	jchar	(*GetFieldChar)(JRIEnv* env, jint op, void* a, jint b);
	jshort	(*GetFieldShort)(JRIEnv* env, jint op, void* a, jint b);
	jint	(*GetFieldInt)(JRIEnv* env, jint op, void* a, jint b);
	jlong	(*GetFieldLong)(JRIEnv* env, jint op, void* a, jint b);
	jfloat	(*GetFieldFloat)(JRIEnv* env, jint op, void* a, jint b);
	jdouble	(*GetFieldDouble)(JRIEnv* env, jint op, void* a, jint b);
	void	(*SetField)(JRIEnv* env, jint op, void* a, jint b, void* c);
	void	(*SetFieldBoolean)(JRIEnv* env, jint op, void* a, jint b, jbool c);
	void	(*SetFieldByte)(JRIEnv* env, jint op, void* a, jint b, jbyte c);
	void	(*SetFieldChar)(JRIEnv* env, jint op, void* a, jint b, jchar c);
	void	(*SetFieldShort)(JRIEnv* env, jint op, void* a, jint b, jshort c);
	void	(*SetFieldInt)(JRIEnv* env, jint op, void* a, jint b, jint c);
	void	(*SetFieldLong)(JRIEnv* env, jint op, void* a, jint b, jlong c);
	void	(*SetFieldFloat)(JRIEnv* env, jint op, void* a, jint b, jfloat c);
	void	(*SetFieldDouble)(JRIEnv* env, jint op, void* a, jint b, jdouble c);
	jbool	(*IsSubclassOf)(JRIEnv* env, jint op, struct java_lang_Class* a, struct java_lang_Class* b);
	jint	(*GetStaticMethodID)(JRIEnv* env, jint op, struct java_lang_Class* a, const char* b, const char* c);
	void*	(*CallStaticMethod)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	void*	(*CallStaticMethodV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	void*	(*CallStaticMethodA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jbool	(*CallStaticMethodBoolean)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jbool	(*CallStaticMethodBooleanV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jbool	(*CallStaticMethodBooleanA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jbyte	(*CallStaticMethodByte)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jbyte	(*CallStaticMethodByteV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jbyte	(*CallStaticMethodByteA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jchar	(*CallStaticMethodChar)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jchar	(*CallStaticMethodCharV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jchar	(*CallStaticMethodCharA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jshort	(*CallStaticMethodShort)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jshort	(*CallStaticMethodShortV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jshort	(*CallStaticMethodShortA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jint	(*CallStaticMethodInt)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jint	(*CallStaticMethodIntV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jint	(*CallStaticMethodIntA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jlong	(*CallStaticMethodLong)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jlong	(*CallStaticMethodLongV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jlong	(*CallStaticMethodLongA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jfloat	(*CallStaticMethodFloat)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jfloat	(*CallStaticMethodFloatV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jfloat	(*CallStaticMethodFloatA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jdouble	(*CallStaticMethodDouble)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, ...);
	jdouble	(*CallStaticMethodDoubleV)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, va_list c);
	jdouble	(*CallStaticMethodDoubleA)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, JRIValue* c);
	jint	(*GetStaticFieldID)(JRIEnv* env, jint op, struct java_lang_Class* a, const char* b, const char* c);
	void*	(*GetStaticField)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jbool	(*GetStaticFieldBoolean)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jbyte	(*GetStaticFieldByte)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jchar	(*GetStaticFieldChar)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jshort	(*GetStaticFieldShort)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jint	(*GetStaticFieldInt)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jlong	(*GetStaticFieldLong)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jfloat	(*GetStaticFieldFloat)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	jdouble	(*GetStaticFieldDouble)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b);
	void	(*SetStaticField)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, void* c);
	void	(*SetStaticFieldBoolean)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jbool c);
	void	(*SetStaticFieldByte)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jbyte c);
	void	(*SetStaticFieldChar)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jchar c);
	void	(*SetStaticFieldShort)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jshort c);
	void	(*SetStaticFieldInt)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jint c);
	void	(*SetStaticFieldLong)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jlong c);
	void	(*SetStaticFieldFloat)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jfloat c);
	void	(*SetStaticFieldDouble)(JRIEnv* env, jint op, struct java_lang_Class* a, jint b, jdouble c);
	struct java_lang_String*	(*NewString)(JRIEnv* env, jint op, const jchar* a, jint b);
	jint	(*GetStringLength)(JRIEnv* env, jint op, struct java_lang_String* a);
	const jchar*	(*GetStringChars)(JRIEnv* env, jint op, struct java_lang_String* a);
	struct java_lang_String*	(*NewStringUTF)(JRIEnv* env, jint op, const jbyte* a, jint b);
	jint	(*GetStringUTFLength)(JRIEnv* env, jint op, struct java_lang_String* a);
	const jbyte*	(*GetStringUTFChars)(JRIEnv* env, jint op, struct java_lang_String* a);
	void*	(*NewScalarArray)(JRIEnv* env, jint op, jint a, const char* b, const jbyte* c);
	jint	(*GetScalarArrayLength)(JRIEnv* env, jint op, void* a);
	jbyte*	(*GetScalarArrayElements)(JRIEnv* env, jint op, void* a);
	void*	(*NewObjectArray)(JRIEnv* env, jint op, jint a, struct java_lang_Class* b, void* c);
	jint	(*GetObjectArrayLength)(JRIEnv* env, jint op, void* a);
	void*	(*GetObjectArrayElement)(JRIEnv* env, jint op, void* a, jint b);
	void	(*SetObjectArrayElement)(JRIEnv* env, jint op, void* a, jint b, void* c);
	void	(*RegisterNatives)(JRIEnv* env, jint op, struct java_lang_Class* a, char** b, void** c);
	void	(*UnregisterNatives)(JRIEnv* env, jint op, struct java_lang_Class* a);
	struct java_lang_Class*	(*DefineClass)(JRIEnv* env, jint op, struct java_lang_ClassLoader* a, jbyte* b, jsize bLen);
	struct java_lang_String*	(*NewStringPlatform)(JRIEnv* env, jint op, const jbyte* a, jint b, const jbyte* c, jint d);
	const jbyte*	(*GetStringPlatformChars)(JRIEnv* env, jint op, struct java_lang_String* a, const jbyte* b, jint c);
};

/*
** ****************************************************************************
** JRIEnv Operation IDs
** ***************************************************************************
*/

typedef enum JRIEnvOperations {
	JRI_Reserved0_op,
	JRI_Reserved1_op,
	JRI_Reserved2_op,
	JRI_Reserved3_op,
	JRI_FindClass_op,
	JRI_Throw_op,
	JRI_ThrowNew_op,
	JRI_ExceptionOccurred_op,
	JRI_ExceptionDescribe_op,
	JRI_ExceptionClear_op,
	JRI_NewGlobalRef_op,
	JRI_DisposeGlobalRef_op,
	JRI_GetGlobalRef_op,
	JRI_SetGlobalRef_op,
	JRI_IsSameObject_op,
	JRI_NewObject_op,
	JRI_NewObject_op_va_list,
	JRI_NewObject_op_array,
	JRI_GetObjectClass_op,
	JRI_IsInstanceOf_op,
	JRI_GetMethodID_op,
	JRI_CallMethod_op,
	JRI_CallMethod_op_va_list,
	JRI_CallMethod_op_array,
	JRI_CallMethodBoolean_op,
	JRI_CallMethodBoolean_op_va_list,
	JRI_CallMethodBoolean_op_array,
	JRI_CallMethodByte_op,
	JRI_CallMethodByte_op_va_list,
	JRI_CallMethodByte_op_array,
	JRI_CallMethodChar_op,
	JRI_CallMethodChar_op_va_list,
	JRI_CallMethodChar_op_array,
	JRI_CallMethodShort_op,
	JRI_CallMethodShort_op_va_list,
	JRI_CallMethodShort_op_array,
	JRI_CallMethodInt_op,
	JRI_CallMethodInt_op_va_list,
	JRI_CallMethodInt_op_array,
	JRI_CallMethodLong_op,
	JRI_CallMethodLong_op_va_list,
	JRI_CallMethodLong_op_array,
	JRI_CallMethodFloat_op,
	JRI_CallMethodFloat_op_va_list,
	JRI_CallMethodFloat_op_array,
	JRI_CallMethodDouble_op,
	JRI_CallMethodDouble_op_va_list,
	JRI_CallMethodDouble_op_array,
	JRI_GetFieldID_op,
	JRI_GetField_op,
	JRI_GetFieldBoolean_op,
	JRI_GetFieldByte_op,
	JRI_GetFieldChar_op,
	JRI_GetFieldShort_op,
	JRI_GetFieldInt_op,
	JRI_GetFieldLong_op,
	JRI_GetFieldFloat_op,
	JRI_GetFieldDouble_op,
	JRI_SetField_op,
	JRI_SetFieldBoolean_op,
	JRI_SetFieldByte_op,
	JRI_SetFieldChar_op,
	JRI_SetFieldShort_op,
	JRI_SetFieldInt_op,
	JRI_SetFieldLong_op,
	JRI_SetFieldFloat_op,
	JRI_SetFieldDouble_op,
	JRI_IsSubclassOf_op,
	JRI_GetStaticMethodID_op,
	JRI_CallStaticMethod_op,
	JRI_CallStaticMethod_op_va_list,
	JRI_CallStaticMethod_op_array,
	JRI_CallStaticMethodBoolean_op,
	JRI_CallStaticMethodBoolean_op_va_list,
	JRI_CallStaticMethodBoolean_op_array,
	JRI_CallStaticMethodByte_op,
	JRI_CallStaticMethodByte_op_va_list,
	JRI_CallStaticMethodByte_op_array,
	JRI_CallStaticMethodChar_op,
	JRI_CallStaticMethodChar_op_va_list,
	JRI_CallStaticMethodChar_op_array,
	JRI_CallStaticMethodShort_op,
	JRI_CallStaticMethodShort_op_va_list,
	JRI_CallStaticMethodShort_op_array,
	JRI_CallStaticMethodInt_op,
	JRI_CallStaticMethodInt_op_va_list,
	JRI_CallStaticMethodInt_op_array,
	JRI_CallStaticMethodLong_op,
	JRI_CallStaticMethodLong_op_va_list,
	JRI_CallStaticMethodLong_op_array,
	JRI_CallStaticMethodFloat_op,
	JRI_CallStaticMethodFloat_op_va_list,
	JRI_CallStaticMethodFloat_op_array,
	JRI_CallStaticMethodDouble_op,
	JRI_CallStaticMethodDouble_op_va_list,
	JRI_CallStaticMethodDouble_op_array,
	JRI_GetStaticFieldID_op,
	JRI_GetStaticField_op,
	JRI_GetStaticFieldBoolean_op,
	JRI_GetStaticFieldByte_op,
	JRI_GetStaticFieldChar_op,
	JRI_GetStaticFieldShort_op,
	JRI_GetStaticFieldInt_op,
	JRI_GetStaticFieldLong_op,
	JRI_GetStaticFieldFloat_op,
	JRI_GetStaticFieldDouble_op,
	JRI_SetStaticField_op,
	JRI_SetStaticFieldBoolean_op,
	JRI_SetStaticFieldByte_op,
	JRI_SetStaticFieldChar_op,
	JRI_SetStaticFieldShort_op,
	JRI_SetStaticFieldInt_op,
	JRI_SetStaticFieldLong_op,
	JRI_SetStaticFieldFloat_op,
	JRI_SetStaticFieldDouble_op,
	JRI_NewString_op,
	JRI_GetStringLength_op,
	JRI_GetStringChars_op,
	JRI_NewStringUTF_op,
	JRI_GetStringUTFLength_op,
	JRI_GetStringUTFChars_op,
	JRI_NewScalarArray_op,
	JRI_GetScalarArrayLength_op,
	JRI_GetScalarArrayElements_op,
	JRI_NewObjectArray_op,
	JRI_GetObjectArrayLength_op,
	JRI_GetObjectArrayElement_op,
	JRI_SetObjectArrayElement_op,
	JRI_RegisterNatives_op,
	JRI_UnregisterNatives_op,
	JRI_DefineClass_op,
	JRI_NewStringPlatform_op,
	JRI_GetStringPlatformChars_op
} JRIEnvOperations;

#ifdef __cplusplus
} /* extern "C" */
#endif /* __cplusplus */

#endif /* JRI_H */
/******************************************************************************/
