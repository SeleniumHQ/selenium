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
	findElementById(&node, (IHTMLDOMNode*) elementPointer, converted);
	env->ReleaseStringChars(id, (const jchar*) converted);

	if (!node)
		throwNoSuchElementException(env, message.c_str());

	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerElement");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	ElementWrapper* wrapper = new ElementWrapper((InternetExplorerDriver*) iePointer, node);
	return env->NewObject(clazz, cId, (jlong) wrapper);
}

jobject JNICALL Java_org_openqa_selenium_ie_Finder_selectElementsById
  (JNIEnv *, jclass, jlong, jstring, jobject) 
{
	return NULL;
}

#ifdef __cplusplus
}
#endif
