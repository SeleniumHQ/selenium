#include "utils.h"
#include "stdafx.h"
#include <iostream>

using namespace std;

#include <jni.h>

void throwNoSuchElementException(JNIEnv *env, const char *message)
{
	jclass newExcCls;
	env->ExceptionDescribe();
	env->ExceptionClear();
	newExcCls = env->FindClass("com/thoughtworks/webdriver/NoSuchElementException");
	if (newExcCls == NULL) {
		return;
	}
	env->ThrowNew(newExcCls, message);
}

void throwRunTimeException(JNIEnv *env, const char *message)
{
	jclass newExcCls;
	env->ExceptionDescribe();
	env->ExceptionClear();
	newExcCls = env->FindClass("java/lang/RuntimeException");
	if (newExcCls == NULL) {
		return;
	}
	env->ThrowNew(newExcCls, message);
}

void startCom() 
{
	if (!SUCCEEDED(CoInitialize(NULL))) {
		throw "Cannot initialize COM";
	}
}

const char* bstr2char(const BSTR toConvert) 
{
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
			return toConvert.boolVal == VARIANT_TRUE ? "true" : "false";

		case VT_BSTR: 
			return bstr2char(toConvert.bstrVal);

		case VT_NULL:
			return NULL;

		default:
			cerr << "Unknown variant type: " << type << endl;
	}

	return NULL;
}