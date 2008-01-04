#include "stdafx.h"
#include "utils.h"
#include <iostream>
#include "Node.h"
#include "ElementNode.h"
#include "TextNode.h"
#include <string>

using namespace std;

#include <jni.h>

void throwException(JNIEnv *env, const char* className, const char *message)
{
	jclass newExcCls;
	env->ExceptionDescribe();
	env->ExceptionClear();
	newExcCls = env->FindClass(className);
	if (newExcCls == NULL) {
		return;
	}
	env->ThrowNew(newExcCls, message);
}

void throwNoSuchElementException(JNIEnv *env, const char *message)
{
	throwException(env, "com/thoughtworks/webdriver/NoSuchElementException", message);
}

void throwRunTimeException(JNIEnv *env, const char *message)
{
	throwException(env, "java/lang/RuntimeException", message);
}

void throwUnsupportedOperationException(JNIEnv *env, const char *message)
{
	throwException(env, "java/lang/UnsupportedOperationException", message);
}

void startCom() 
{
	if (!SUCCEEDED(CoInitialize(NULL))) {
		throw "Cannot initialize COM";
	}
}

jobject newJavaInternetExplorerDriver(JNIEnv* env, InternetExplorerDriver* driver) 
{
	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/InternetExplorerDriver");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) driver);
}

jobject initJavaXPathNode(JNIEnv* env, Node* node) 
{
	if (node == NULL)
		return NULL;

	jclass clazz;
	if (dynamic_cast<TextNode*>(node)) 
	{
		clazz = env->FindClass("com/thoughtworks/webdriver/ie/TextNode");
	} else 
	{
		clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	}
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) node);
}


const wchar_t* variant2wchar(const VARIANT toConvert) 
{
	VARTYPE type = toConvert.vt;
	wchar_t* toReturn;

	switch (type) {
		case VT_BOOL:
			if (toConvert.boolVal) {
				toReturn = new wchar_t[5];
				wcscpy_s(toReturn, 5, L"true");
			} else {
				toReturn = new wchar_t[6];
				wcscpy_s(toReturn, 6, L"false");
			}
			return toReturn;

		case VT_BSTR: 
			return bstr2wchar(toConvert.bstrVal);

		case VT_EMPTY:
			toReturn = new wchar_t[1];
			wcscpy_s(toReturn, 1, L"");
			return toReturn;
/*
		case VT_I4:
			long value = toConvert.lVal;
			int length = value / 10;
			toReturn = new wchar_t[length + 1];
			swprintf(toReturn, length, L"%l", value);
			return toReturn;
*/
		case VT_NULL:
			return NULL;

		default:
			cerr << "Unknown variant type: " << type << endl;
	}

	return NULL;
}

wchar_t* bstr2wchar(BSTR from) 
{
	if (!from) {
			size_t length = 2;
			wchar_t* toReturn = new wchar_t[length];
			wcscpy_s(toReturn, length, L"");
			return toReturn;
	}

	size_t length = SysStringLen(from) + 1;
	wchar_t* toReturn = new wchar_t[length];
	wcscpy_s(toReturn, length, from);
	return toReturn;
}

std::wstring bstr2wstring(BSTR from) 
{
	if (!from) {
		return L"";
	}

	size_t length = SysStringLen(from) + 1;
	wchar_t *buf = new wchar_t[length];
	wcsncpy_s(buf, length, from, length - 1);
	std::wstring toReturn(buf);
	delete[] buf;

	return toReturn;
}