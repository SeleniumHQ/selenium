#include "stdafx.h"
#include "utils.h"
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementById
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring id)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(id, 0);
	std::wstring message(L"Cannot find element using ID: ");
	message.append(converted);

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementById(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(id, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return NULL;
	} 

	env->ReleaseStringChars(id, (const jchar*) converted);	

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
	}
	END_TRY_CATCH_ANY
	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsById
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring elementId, jobject list)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(elementId, 0);
	std::wstring message(L"Cannot find elements using ID: ");
	message.append(converted);

	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	const std::vector<ElementWrapper*>* elements = NULL;
	try {
	 elements = ie->selectElementsById(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(elementId, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return;
	} 
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

	delete elements;
	}
	END_TRY_CATCH_ANY
}

JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByLinkText
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring linkText)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(linkText, 0);
	std::wstring message(L"Cannot find element using Link: ");
	message.append(converted);

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByLink(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(linkText, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return NULL;
	} 

	env->ReleaseStringChars(linkText, (const jchar*) converted);	

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
	}
	END_TRY_CATCH_ANY
	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByLinkText
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring linkText, jobject list)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(linkText, 0);
	std::wstring message(L"Cannot find elements using Link: ");
	message.append(converted);

	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	const std::vector<ElementWrapper*>* elements = NULL;
	try {
	 elements = ie->selectElementsByLink(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(linkText, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return;
	} 
	env->ReleaseStringChars(linkText, (const jchar*) converted);

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
	END_TRY_CATCH_ANY
}


JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);
	std::wstring message(L"Cannot find element using Name: ");
	message.append(converted);

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByName(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(name, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return NULL;
	} 

	env->ReleaseStringChars(name, (const jchar*) converted);	

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
	}
	END_TRY_CATCH_ANY
	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring name, jobject list)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(name, 0);
	std::wstring message(L"Cannot find elements using Name: ");
	message.append(converted);

	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	const std::vector<ElementWrapper*>* elements = NULL;
	try {
	 elements = ie->selectElementsByName(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(name, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return;
	} 
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
	END_TRY_CATCH_ANY
}


JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByClassName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring classname)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(classname, 0);
	std::wstring message(L"Cannot find element using ClassName: ");
	message.append(converted);

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByClassName(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(classname, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return NULL;
	} 

	env->ReleaseStringChars(classname, (const jchar*) converted);	

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
	}
	END_TRY_CATCH_ANY
	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByClassName
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring classname, jobject list)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(classname, 0);
	std::wstring message(L"Cannot find elements using ClassName: ");
	message.append(converted);

	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	const std::vector<ElementWrapper*>* elements = NULL;
	try {
	 elements = ie->selectElementsByClassName(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(classname, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return;
	} 
	env->ReleaseStringChars(classname, (const jchar*) converted);

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
	END_TRY_CATCH_ANY
}


JNIEXPORT jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementByXPath
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring xpath)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);
	std::wstring message(L"Cannot find element using XPath: ");
	message.append(converted);

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	ElementWrapper* wrapper = NULL;
	try {
		wrapper = ie->selectElementByXPath(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(xpath, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return NULL;
	} 

	env->ReleaseStringChars(xpath, (const jchar*) converted);	

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) wrapper);
	}
	END_TRY_CATCH_ANY
	return NULL;
}

JNIEXPORT void JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsByXPath
  (JNIEnv *env, jclass ignored, jlong iePointer, jlong elementPointer, jstring xpath, jobject list)
{
	TRY
	{
	wchar_t* converted = (wchar_t *)env->GetStringChars(xpath, 0);
	std::wstring message(L"Cannot find elements using XPath: ");
	message.append(converted);

	jclass listClass = env->FindClass("java/util/List");
	jmethodID addId = env->GetMethodID(listClass, "add", "(Ljava/lang/Object;)Z");

	jclass ieeClass = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(ieeClass, "<init>", "(J)V");

	InternetExplorerDriver* ie = (InternetExplorerDriver*)(iePointer);
	CComPtr<IHTMLElement> elem = (IHTMLElement*) elementPointer;

	const std::vector<ElementWrapper*>* elements = NULL;
	try {
	 elements = ie->selectElementsByXPath(elem, converted);
	} catch (std::wstring& ) {
		env->ReleaseStringChars(xpath, (const jchar*) converted);	
		throwNoSuchElementException(env, message.c_str());
		return;
	} 
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
	END_TRY_CATCH_ANY
}


#ifdef __cplusplus
}
#endif
