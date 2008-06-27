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

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementByXPath
  (JNIEnv *env, jobject obj, jstring xpath)
{
	InternetExplorerDriver *ie = getIe(env, obj);
	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementByXPath(converted);
		env->ReleaseStringChars(xpath, (const jchar*) converted);	

		if (!wrapper)
			throwNoSuchElementException(env, "Cannot find element by XPath");

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		throwNoSuchElementException(env, message);
		return NULL;
	} 
	env->ReleaseStringChars(xpath, (const jchar*) converted);
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementsByXPath
  (JNIEnv *env, jobject obj, jstring xpath, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver *ie = getIe(env, obj);
	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);

	const std::vector<ElementWrapper*>* elements = ie->selectElementsByXPath(converted);
	env->ReleaseStringChars(xpath, (const jchar*) converted);

	std::vector<ElementWrapper*>::const_iterator end = elements->end();
	std::vector<ElementWrapper*>::const_iterator cur = elements->begin();

	while(cur < end)
	{
		ElementWrapper* wrapper = *cur;
		jobject wrapped = env->NewObject(ieeClass, cId, wrapper);
		env->CallVoidMethod(list, addId, wrapped);
		cur++;
	}
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementById
  (JNIEnv *env, jobject obj, jstring elementId)
{
	InternetExplorerDriver *ie = getIe(env, obj);
	wchar_t* converted = (wchar_t *)env->GetStringChars(elementId, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementById(converted);
		env->ReleaseStringChars(elementId, (const jchar*) converted);	

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		throwNoSuchElementException(env, message);
		return NULL;
	} 
	env->ReleaseStringChars(elementId, (const jchar*) converted);	
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementByLink
  (JNIEnv *env, jobject obj, jstring linkText)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (const wchar_t*)env->GetStringChars(linkText, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementByLink(converted);
		env->ReleaseStringChars(linkText, (jchar*) converted);

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		env->ReleaseStringChars(linkText, (jchar*) converted);
		throwNoSuchElementException(env, message);
		return NULL;
	} 

}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementByName
  (JNIEnv *env, jobject obj, jstring name)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (const wchar_t*)env->GetStringChars(name, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementByName(converted);
		env->ReleaseStringChars(name, (jchar*) converted);

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		env->ReleaseStringChars(name, (jchar*) converted);
		throwNoSuchElementException(env, message);
		return NULL;
	} 
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_InternetExplorerDriver_selectElementByClassName
  (JNIEnv *env, jobject obj, jstring name)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (const wchar_t*)env->GetStringChars(name, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementByClassName(converted);
		env->ReleaseStringChars(name, (jchar*) converted);

		jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		env->ReleaseStringChars(name, (jchar*) converted);
		throwNoSuchElementException(env, message);
		return NULL;
	} 
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


#ifdef __cplusplus
}
#endif
