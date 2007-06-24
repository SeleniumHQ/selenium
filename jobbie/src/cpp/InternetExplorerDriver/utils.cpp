#include "stdafx.h"
#include "utils.h"
#include <iostream>

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

		case VT_NULL:
			return NULL;

		default:
			cerr << "Unknown variant type: " << type << endl;
	}

	return NULL;
}

wchar_t* bstr2wchar(BSTR from) 
{
	size_t length = SysStringLen(from) + 1;
	wchar_t* toReturn = new wchar_t[length];
	wcscpy_s(toReturn, length, from);
	return toReturn;
}