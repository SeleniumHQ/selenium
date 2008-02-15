#include "stdafx.h"

#include <iostream>
#include <sstream>
#include <string>

#include <jni.h>

#include "ElementNode.h"
#include "Node.h"
#include "TextNode.h"
#include "utils.h"

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
	throwException(env, "com/googlecode/webdriver/NoSuchElementException", message);
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
	jclass clazz = env->FindClass("com/googlecode/webdriver/ie/InternetExplorerDriver");
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
		clazz = env->FindClass("com/googlecode/webdriver/ie/TextNode");
	} else 
	{
		clazz = env->FindClass("com/googlecode/webdriver/ie/ElementNode");
	}
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) node);
}

static std::wstring stringify(int number)
{
	std::wostringstream o;
	o << number;
	return o.str();
}

std::wstring variant2wchar(const VARIANT toConvert) 
{
	VARTYPE type = toConvert.vt;

	switch (type) {
		case VT_BOOL:
			return (toConvert.boolVal) ? L"true" : L"false";

		case VT_BSTR: 
			return bstr2wstring(toConvert.bstrVal);

		case VT_EMPTY:
		case VT_NULL:
			return L"";
/*
		case VT_I4:
			long value = toConvert.lVal;
			int length = value / 10;
			toReturn = new wchar_t[length + 1];
			swprintf(toReturn, length, L"%l", value);
			return toReturn;
*/

		default:
			std::wstring msg(L"Unknown variant type: ");
			msg += stringify(type);
			OutputDebugString(msg.c_str());
			return L"";
	}
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

jstring wstring2jstring(JNIEnv *env, const std::wstring& text)
{
	return env->NewString((const jchar*) text.c_str(), (jsize) text.length());
}
