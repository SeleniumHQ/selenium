#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "ElementNode.h"
#include "ElementWrapper.h"
#include <iostream>
#include <vector>
#include <iterator>

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
  (JNIEnv *env, jclass clazz, jlong driverPointer, jobject elementNode)
{
	jclass cls = env->GetObjectClass(elementNode);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(elementNode, fid);

	ElementNode* rawNode = (ElementNode*) value;

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) driverPointer, rawNode->getDomNode());
	clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_click
  (JNIEnv *env, jobject obj) 
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	InternetExplorerDriver* driver = wrapper->click();

	return newJavaInternetExplorerDriver(env, driver);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getValue
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	const wchar_t* value = wrapper->getValue();

	jstring toReturn = env->NewString((const jchar*) value, (jsize) wcslen(value));
	delete value;
	return toReturn;
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_setValue
  (JNIEnv *env, jobject obj, jstring newValue)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	wchar_t* converted = (wchar_t*) env->GetStringChars(newValue, NULL);
	InternetExplorerDriver* driver = wrapper->setValue(converted);

	return newJavaInternetExplorerDriver(env, driver);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getText
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	const wchar_t* value = wrapper->getText();

	jstring toReturn = env->NewString((const jchar*) value, (jsize) wcslen(value));

	if (value) delete value;

	return toReturn;
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getAttribute
  (JNIEnv *env, jobject obj, jstring attributeName)
{
	ElementWrapper* wrapper = getWrapper(env, obj);

	const wchar_t* converted = (wchar_t*) env->GetStringChars(attributeName, NULL);
	const wchar_t* value = wrapper->getAttribute(converted);
	env->ReleaseStringChars(attributeName, (const jchar*) converted);
	wchar_t* toReturn = (wchar_t*) value;
	if (value == NULL) {
		toReturn = new wchar_t[1];
		wcscpy_s(toReturn, 1, L"");
	}

	jstring toReturn2 = env->NewString((const jchar*) toReturn, (jsize) wcslen(toReturn));
	delete toReturn;
	return toReturn2;
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

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_setSelected
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	try {
		InternetExplorerDriver* driver = wrapper->setSelected();
		return newJavaInternetExplorerDriver(env, driver);
	} catch (const char *message) {
		throwUnsupportedOperationException(env, message);
	}
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_submit
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	try {
		InternetExplorerDriver* driver = wrapper->submit();
		return newJavaInternetExplorerDriver(env, driver);
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

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_isDisplayed
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	return wrapper->isDisplayed() ? JNI_TRUE : JNI_FALSE;
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getLocation
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	long x = wrapper->getX();
	long y = wrapper->getY();

	jclass pointClass = env->FindClass("java/awt/Point");
	jmethodID cId = env->GetMethodID(pointClass, "<init>", "(II)V");
	
	return env->NewObject(pointClass, cId, x, y);
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getSize
  (JNIEnv *env, jobject obj) 
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	long width = wrapper->getWidth();
	long height = wrapper->getHeight();

	jclass pointClass = env->FindClass("java/awt/Dimension");
	jmethodID cId = env->GetMethodID(pointClass, "<init>", "(II)V");

	return env->NewObject(pointClass, cId, width, height);
}

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getChildrenOfTypeNatively
  (JNIEnv *env, jobject obj, jobject list, jstring tagName)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	const wchar_t* converted = (wchar_t*) env->GetStringChars(tagName, NULL);
	ElementWrapper* wrapper = getWrapper(env, obj);
	const std::vector<ElementWrapper*>* elements = wrapper->getChildrenWithTagName(converted);

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

JNIEXPORT void JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_deleteStoredObject
  (JNIEnv *env, jobject obj)
{
	ElementWrapper* wrapper = getWrapper(env, obj);
	delete wrapper;
}

#ifdef __cplusplus
}
#endif