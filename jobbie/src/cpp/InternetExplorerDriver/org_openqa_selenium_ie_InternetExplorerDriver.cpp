// This is the main DLL file.

#include "stdafx.h"
#include "utils.h"
#include "InternetExplorerDriver.h"
#include "ElementWrapper.h"
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

InternetExplorerDriver* getIe(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "iePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (InternetExplorerDriver *) value;
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_doExecuteScript
  (JNIEnv *env, jobject obj, jstring script, jobjectArray args)
{
	InternetExplorerDriver* wrapper = getIe(env, obj);

	// Convert the args into something we can use elsewhere.
	jclass numberClazz = env->FindClass("java/lang/Number");
	jclass booleanClazz = env->FindClass("java/lang/Boolean");
	jclass stringClazz = env->FindClass("java/lang/String");
	jclass elementClazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");

	jmethodID longValue = env->GetMethodID(numberClazz, "longValue", "()J");
	jmethodID booleanValue = env->GetMethodID(booleanClazz, "booleanValue", "()Z");
	jfieldID elementPointer = env->GetFieldID(elementClazz, "nodePointer", "J");

	jsize length = env->GetArrayLength(args);


	SAFEARRAYBOUND bounds;
	bounds.cElements = length;
	bounds.lLbound = 0;
	SAFEARRAY* convertedItems = SafeArrayCreate(VT_VARIANT, 1, &bounds);
	
	LONG index[1];
	for (jsize i = 0; i < length; i++) {
		index[0] = i;
		VARIANT dest;
		VariantInit(&dest);

		jobject arrayObject = env->GetObjectArrayElement(args, i);
		jclass objClazz = env->GetObjectClass(arrayObject);
		
		if (env->IsInstanceOf(arrayObject, numberClazz)) {
			jlong value = env->CallLongMethod(arrayObject, longValue);

			dest.vt = VT_I4;
			dest.lVal = (LONG) value;
		} else if (env->IsInstanceOf(arrayObject, stringClazz)) {
			wchar_t *converted = (wchar_t *)env->GetStringChars((jstring) arrayObject, 0);
			std::wstring value(converted);
			env->ReleaseStringChars((jstring) arrayObject, (jchar*) converted);

			dest.vt = VT_BSTR;
			dest.bstrVal = SysAllocString(value.c_str());
		} else if (env->IsInstanceOf(arrayObject, booleanClazz)) {
			bool value = env->CallBooleanMethod(arrayObject, booleanValue) == JNI_TRUE;

			dest.vt = VT_BOOL;
			dest.boolVal = value;
		} else if (env->IsInstanceOf(arrayObject, elementClazz)) {
			ElementWrapper* element = (ElementWrapper*) env->GetLongField(arrayObject, elementPointer);
			
			dest.vt = VT_DISPATCH;
			dest.pdispVal = element->getWrappedElement();
		}

		SafeArrayPutElement(convertedItems, &i, &dest);
	}

	const wchar_t* converted = (wchar_t *)env->GetStringChars(script, 0);
	VARIANT result;
	VariantInit(&result);
	wrapper->executeScript(converted, convertedItems, &result);
	env->ReleaseStringChars(script, (jchar*) converted);

	// TODO (simon): Does this clear everything properly?
	SafeArrayDestroy(convertedItems);

	if (result.vt == VT_BSTR) {
		return wstring2jstring(env, bstr2wstring(result.bstrVal));
	} else if (result.vt == VT_DISPATCH) {
		// Attempt to create a new webelement
		CComQIPtr<IHTMLDOMNode> node(result.pdispVal);
		if (!node) {
			cerr << "Cannot convert response to node. Attempting to convert to string" << endl;
			return wstring2jstring(env, variant2wchar(result));
		}

		ElementWrapper* element = new ElementWrapper(wrapper, node);

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) element);
	} else if (result.vt == VT_BOOL) {
		jclass clazz = env->FindClass("java/lang/Boolean");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(Z)V");

		return env->NewObject(clazz, cId, (jboolean) (result.boolVal == VARIANT_TRUE));
	} else if (result.vt == VT_I4) {
		jclass clazz = env->FindClass("java/lang/Long");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
		return env->NewObject(clazz, cId, (jlong) result.lVal);
	} else if (result.vt == VT_I8) {
		jclass clazz = env->FindClass("java/lang/Long");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
		return env->NewObject(clazz, cId, (jlong) result.dblVal);
	} else if (result.vt == VT_USERDEFINED) {
		jclass newExcCls;
		env->ExceptionDescribe();
		env->ExceptionClear();
		newExcCls = env->FindClass("java/lang/RuntimeException");
		jmethodID cId = env->GetMethodID(newExcCls, "<init>", "(Ljava/lang/String;)V");

		jstring message = wstring2jstring(env, bstr2wstring(result.bstrVal));

		jobject exception;
		if (message) {
			exception = env->NewObject(newExcCls, cId, message);
		} else {
			cout << "Falling back" << endl;
			exception = env->NewObject(newExcCls, cId, (jstring) "Cannot extract cause of error");
		}

		env->Throw((jthrowable) exception);
		return NULL;
	}

	cerr << "Unknown variant type. Will attempt to coerce to string: " << result.vt << endl;
	return wstring2jstring(env, variant2wchar(result));
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_close
(JNIEnv *env, jobject obj) 
{
	InternetExplorerDriver* wrapper = getIe(env, obj);
	wrapper->close();

	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_startComNatively
  (JNIEnv *env, jobject obj)
{
	startCom();
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_openIe
  (JNIEnv *env, jobject obj)
{
	try {
		InternetExplorerDriver* wrapper = new InternetExplorerDriver();

		jclass cls = env->GetObjectClass(obj);
		jfieldID fid = env->GetFieldID(cls, "iePointer", "J");
		env->SetLongField(obj, fid, (jlong) wrapper);
	} catch (const char *message) {
		throwRunTimeException(env, message);
	}
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_setVisible
  (JNIEnv *env, jobject obj, jboolean isVisible)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->setVisible(isVisible == JNI_TRUE);
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_waitForLoadToComplete
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->waitForNavigateToFinish();
}

JNIEXPORT jstring JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_getCurrentUrl
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	return wstring2jstring(env, ie->getCurrentUrl());
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_get
  (JNIEnv *env, jobject obj, jstring url)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (wchar_t *)env->GetStringChars(url, 0);
	ie->get(converted);
	env->ReleaseStringChars(url, (jchar*) converted);
}

JNIEXPORT jstring JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_getTitle
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	return wstring2jstring(env, ie->getTitle());
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	if (ie)
		delete ie;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_setFrameIndex
  (JNIEnv *env, jobject obj, jint frameIndex)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->switchToFrame((int) frameIndex);
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_goBack
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->goBack();
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_goForward
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->goForward();
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_doAddCookie
  (JNIEnv *env, jobject obj, jstring cookieString)
{
	InternetExplorerDriver* ie = getIe(env, obj);

	const wchar_t* converted = (wchar_t *)env->GetStringChars(cookieString, 0);
	ie->addCookie(converted);
	env->ReleaseStringChars(cookieString, (jchar*) converted);
}

JNIEXPORT jstring JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_doGetCookies
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	return wstring2jstring(env, ie->getCookies());
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_doSetMouseSpeed
  (JNIEnv *env, jobject obj, jint speed) 
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->setSpeed((int) speed);
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_doSwitchToActiveElement
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ElementWrapper* element = ie->getActiveElement();

	if (!element)
		return NULL;

    jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) element);
}

#ifdef __cplusplus
}
#endif
