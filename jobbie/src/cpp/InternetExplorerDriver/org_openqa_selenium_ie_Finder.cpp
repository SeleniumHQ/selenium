#include "stdafx.h"
#include "finder.h"
#include "utils.h"
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementById
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring id)
{
	wchar_t* converted = (wchar_t *)env->GetStringChars(id, 0);
	std::wstring message(L"Cannot find element using ID: ");
	message.append(converted);

	CComPtr<IHTMLDOMNode> node;
	findElementById(&node, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(id, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsById
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring elementId, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	wchar_t* converted = (wchar_t *)env->GetStringChars(elementId, 0);

	std::vector<ElementWrapper*>* elements = new std::vector<ElementWrapper*>();

	findElementsById(elements, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(elementId, (const jchar*) converted);

	std::vector<ElementWrapper*>::const_iterator end = elements->end();
	std::vector<ElementWrapper*>::const_iterator cur = elements->begin();

	while(cur < end)
	{
		ElementWrapper* wrapper = *cur;
		jobject wrapped = env->NewObject(ieeClass, cId, wrapper);
		env->CallVoidMethod(list, addId, wrapped);
		cur++;
	}

	// TODO: Does this do what I think it does?
	delete elements;
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name)
{
	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);
	std::wstring message(L"Cannot find element using name: ");
	message.append(converted);

	CComPtr<IHTMLDOMNode> node;
	findElementByName(&node, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}


JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);

	std::vector<ElementWrapper*>* elements = new std::vector<ElementWrapper*>();

	findElementsByName(elements, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	std::vector<ElementWrapper*>::const_iterator end = elements->end();
	std::vector<ElementWrapper*>::const_iterator cur = elements->begin();

	while(cur < end)
	{
		ElementWrapper* wrapper = *cur;
		jobject wrapped = env->NewObject(ieeClass, cId, wrapper);
		env->CallVoidMethod(list, addId, wrapped);
		cur++;
	}

	delete elements;
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByClassName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name)
{
	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);
	std::wstring message(L"Cannot find element using class name: ");
	message.append(converted);

	CComPtr<IHTMLDOMNode> node;
	findElementByClassName(&node, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}


JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByClassName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);

	std::vector<ElementWrapper*>* elements = new std::vector<ElementWrapper*>();

	findElementsByClassName(elements, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	std::vector<ElementWrapper*>::const_iterator end = elements->end();
	std::vector<ElementWrapper*>::const_iterator cur = elements->begin();

	while(cur < end)
	{
		ElementWrapper* wrapper = *cur;
		jobject wrapped = env->NewObject(ieeClass, cId, wrapper);
		env->CallVoidMethod(list, addId, wrapped);
		cur++;
	}

	delete elements;
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByLinkText
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name)
{
	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);
	std::wstring message(L"Cannot find element using link text: ");
	message.append(converted);

	CComPtr<IHTMLDOMNode> node;
	findElementByLinkText(&node, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}


JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByLinkText
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);

	std::vector<ElementWrapper*>* elements = new std::vector<ElementWrapper*>();

	findElementsByLinkText(elements, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(name, (const jchar*) converted);

	std::vector<ElementWrapper*>::const_iterator end = elements->end();
	std::vector<ElementWrapper*>::const_iterator cur = elements->begin();

	while(cur < end)
	{
		ElementWrapper* wrapper = *cur;
		jobject wrapped = env->NewObject(ieeClass, cId, wrapper);
		env->CallVoidMethod(list, addId, wrapped);
		cur++;
	}

	delete elements;
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByXPath
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring xpath)
{
	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);
	std::wstring message(L"Cannot find element using xpath: ");
	message.append(converted);

	CComPtr<IHTMLDOMNode> node;
	findElementByXPath(&node, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(xpath, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByXPath
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring xpath, jobject list)
{
	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);

	std::vector<ElementWrapper*>* elements = new std::vector<ElementWrapper*>();

	findElementsByXPath(elements, (InternetExplorerDriver*) iePointer, (IHTMLDOMNode*) elementPointer, converted);
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

	delete elements;
}

#ifdef __cplusplus
}
#endif
