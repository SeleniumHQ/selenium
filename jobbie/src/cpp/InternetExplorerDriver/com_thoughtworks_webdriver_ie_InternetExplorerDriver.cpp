// This is the main DLL file.

#include <ExDisp.h>
#include "stdafx.h"
#include "utils.h"
#include "IeWrapper.h"
#include "ElementWrapper.h"
#include "DocumentNode.h"
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

IeWrapper* getIe(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "iePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (IeWrapper *) value;
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
		IeWrapper* wrapper = new IeWrapper();

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
	IeWrapper* ie = getIe(env, obj);
	ie->setVisible(isVisible == JNI_TRUE);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getCurrentUrl
  (JNIEnv *env, jobject obj)
{
	IeWrapper* ie = getIe(env, obj);
	const char *url = ie->getCurrentUrl();
	jstring toReturn = env->NewStringUTF(url);
	delete url;
	return toReturn;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_get
  (JNIEnv *env, jobject obj, jstring url)
{
	IeWrapper* ie = getIe(env, obj);
	const char* converted = (const char*)env->GetStringUTFChars(url, 0);
	ie->get(converted);
	env->ReleaseStringUTFChars(url, converted);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getTitle
  (JNIEnv *env, jobject obj)
{
	IeWrapper* ie = getIe(env, obj);
	const char* title = ie->getTitle();
	jstring toReturn = env->NewStringUTF(title);
	return toReturn;
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_selectElementById
  (JNIEnv *env, jobject obj, jstring elementId)
{
	IeWrapper *ie = getIe(env, obj);
	const char* converted = (const char*)env->GetStringUTFChars(elementId, 0);

	try {
		ElementWrapper* wrapper = ie->selectElementById(converted);

		jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

		return env->NewObject(clazz, cId, (jlong) wrapper);
	} catch (const char *message) {
		throwNoSuchElementException(env, message);
		return NULL;
	} 
	env->ReleaseStringUTFChars(elementId, converted);	
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerDriver_getDocument
  (JNIEnv *env, jobject obj)
{
	IeWrapper *ie = getIe(env, obj);
	IHTMLDocument2 *doc = ie->getDocument();

	DocumentNode *node = new DocumentNode(doc);
	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/DocumentNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) node);
}

#ifdef __cplusplus
}
#endif