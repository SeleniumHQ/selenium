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

const char* bstr2char(const BSTR toConvert) 
{
	if (toConvert == NULL)
		return NULL;

	char* toReturn = NULL;
	const size_t size = SysStringLen(toConvert) + 1;
	if (size > 1) {
		CW2A result(toConvert);
		return _strdup(result);
	} else {
		return _strdup("");
	}
}

const char* variant2char(const VARIANT toConvert) 
{
	VARTYPE type = toConvert.vt;

	switch (type) {
		case VT_BOOL:
			return _strdup(toConvert.boolVal ? "true" : "false");

		case VT_BSTR: 
			return bstr2char(toConvert.bstrVal);

		case VT_EMPTY:
			return _strdup("");

		case VT_NULL:
			return NULL;

		default:
			cerr << "Unknown variant type: " << type << endl;
	}

	return NULL;
}