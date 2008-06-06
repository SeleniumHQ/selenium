#include "stdafx.h"

#include <ctime>
#include <iostream>
#include <sstream>
#include <string>

#include <jni.h>

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
	CoInitialize(NULL);
}

jobject newJavaInternetExplorerDriver(JNIEnv* env, InternetExplorerDriver* driver) 
{
	jclass clazz = env->FindClass("com/googlecode/webdriver/ie/InternetExplorerDriver");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) driver);
}

void wait(long millis)
{
	clock_t end = clock() + millis;
	while (clock() < end) 
	{
		MSG msg;
		PeekMessage( &msg, NULL, 0, 0, PM_REMOVE );
		TranslateMessage(&msg); 
		DispatchMessage(&msg); 
	}
}

static std::wstring stringify(int number)
{
	std::wostringstream o;
	o << number;
	return o.str();
}

std::wstring variant2wchar(VARIANT toConvert) 
{
	VARTYPE type = toConvert.vt;

	switch(type) {
		case VT_BOOL:
			return toConvert.boolVal == VARIANT_TRUE ? L"true" : L"false";

		case VT_BSTR:
			return bstr2wstring(toConvert.bstrVal);

		case VT_EMPTY:
			return L"";

		case VT_NULL:
			// TODO(shs96c): This should really return NULL.
			return L"";

		// This is lame
		case VT_DISPATCH:
			return L"";
	}

	// Fine. Attempt to coerce to a string
	HRESULT res = VariantChangeType(&toConvert, &toConvert, VARIANT_ALPHABOOL, VT_BSTR);
	if (!SUCCEEDED(res)) {
		return L"";
	}
	
	return bstr2wstring(toConvert.bstrVal);
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
	if (!text.c_str())
		return NULL;
	return env->NewString((const jchar*) text.c_str(), (jsize) text.length());
}
