#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "ElementNode.h"
#include "ElementWrapper.h"
#include <iostream>

using namespace std;

ElementWrapper* getWrapper(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (ElementWrapper *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_createInternetExplorerElement
  (JNIEnv *env, jclass clazz, jlong ieWrapper, jobject elementNode)
{
	jclass cls = env->GetObjectClass(elementNode);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(elementNode, fid);

	ElementNode* rawNode = (ElementNode*) value;

	ElementWrapper* wrapper = new ElementWrapper((IeWrapper*) ieWrapper, rawNode->getDomNode());
	clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_click
  (JNIEnv *env, jobject obj) 
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	wrapper->click();
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getValue
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	const char* value = wrapper->getValue();
	return env->NewStringUTF(value);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getText
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	const char* value = wrapper->getText();
	return env->NewStringUTF(value);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getAttribute
  (JNIEnv *env, jobject obj, jstring attributeName)
{
	ElementWrapper* wrapper = getWrapper(env, obj);

	const char* converted = (const char*)env->GetStringUTFChars(attributeName, 0);
	const char* value = wrapper->getAttribute(converted);
	env->ReleaseStringUTFChars(attributeName, converted);
	return env->NewStringUTF(value);
}

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_isEnabled
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	return wrapper->isEnabled() ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_isSelected
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	return wrapper->isSelected() ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_setSelected
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	try {
		wrapper->setSelected();
	} catch (const char *message) {
		throwUnsupportedOperationException(env, message);
	}
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_submit
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	try {
		wrapper->submit();
	} catch (const char* message) {
		throwNoSuchElementException(env, message);
	}
}

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_toggle
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	return wrapper->toggle() ? JNI_TRUE : JNI_FALSE;
}

#ifdef __cplusplus
}
#endif