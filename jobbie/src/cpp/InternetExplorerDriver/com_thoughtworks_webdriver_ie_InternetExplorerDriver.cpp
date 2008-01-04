// This is the main DLL file.

#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "InternetExplorerDriver.h"
#include "ElementWrapper.h"
#include "DocumentNode.h"
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

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_close
(JNIEnv *env, jobject obj) 
{
	InternetExplorerDriver* wrapper = getIe(env, obj);
	wrapper->close();

	return NULL;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_startComNatively
  (JNIEnv *env, jobject obj)
{
	startCom();
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_openIe
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

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_setVisible
  (JNIEnv *env, jobject obj, jboolean isVisible)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->setVisible(isVisible == JNI_TRUE);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_waitForLoadToComplete
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->waitForNavigateToFinish();
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getCurrentUrl
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* url = ie->getCurrentUrl();

	jstring toReturn = env->NewString((const jchar*) url, (jsize) wcslen(url));
	delete url;
	return toReturn;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_get
  (JNIEnv *env, jobject obj, jstring url)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (wchar_t *)env->GetStringChars(url, 0);
	ie->get(converted);
	env->ReleaseStringChars(url, (jchar*) converted);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getTitle
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const std::wstring title(ie->getTitle());
	return env->NewString((const jchar*) title.c_str(), (jsize) title.length());
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_selectElementById
  (JNIEnv *env, jobject obj, jstring elementId)
{
	InternetExplorerDriver *ie = getIe(env, obj);
	wchar_t* converted = (wchar_t *)env->GetStringChars(elementId, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementById(converted);
		env->ReleaseStringChars(elementId, (const jchar*) converted);	

		jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		throwNoSuchElementException(env, message);
		return NULL;
	} 
	env->ReleaseStringChars(elementId, (const jchar*) converted);	
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_selectElementByLink
  (JNIEnv *env, jobject obj, jstring linkText)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* converted = (const wchar_t*)env->GetStringChars(linkText, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementByLink(converted);
		env->ReleaseStringChars(linkText, (jchar*) converted);

		jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		env->ReleaseStringChars(linkText, (jchar*) converted);
		throwNoSuchElementException(env, message);
		return NULL;
	} 

}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getDocument
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver *ie = getIe(env, obj);
	IHTMLDocument2 *doc = ie->getDocument();

	DocumentNode *node = new DocumentNode(doc);
	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/DocumentNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) node);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	if (ie)
		delete ie;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_setFrameIndex
  (JNIEnv *env, jobject obj, jint frameIndex)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->switchToFrame((int) frameIndex);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_goBack
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->goBack();
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_goForward
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	ie->goForward();
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_doAddCookie
  (JNIEnv *env, jobject obj, jstring cookieString)
{
	InternetExplorerDriver* ie = getIe(env, obj);

	const wchar_t* converted = (wchar_t *)env->GetStringChars(cookieString, 0);
	ie->addCookie(converted);
	env->ReleaseStringChars(cookieString, (jchar*) converted);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_doGetCookies
  (JNIEnv *env, jobject obj)
{
	InternetExplorerDriver* ie = getIe(env, obj);
	const wchar_t* cookies = ie->getCookies();

	jstring cookieString = env->NewString((const jchar*) cookies, (jsize) wcslen(cookies));
	delete cookies;
	return cookieString;
}

#ifdef __cplusplus
}
#endif