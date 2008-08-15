#include "stdafx.h"

#include <ctime>
#include <iostream>
#include <sstream>
#include <string>

#include <jni.h>

#include "utils.h"

// Caller frees memory
char* convertFromWideToAscii(const wchar_t* message) 
{
	size_t origsize = wcslen(message) + 1;
    size_t convertedChars = 0;
    char* converted = new char[origsize];
    wcstombs_s(&convertedChars, converted, origsize, message, _TRUNCATE);
	return converted;
}

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
	throwException(env, "org/openqa/selenium/NoSuchElementException", message);
}

void throwNoSuchElementException(JNIEnv *env, const wchar_t *message) 
{
	char* converted = convertFromWideToAscii(message);
	throwNoSuchElementException(env, converted);
	delete[] converted;
}

void throwNoSuchFrameException(JNIEnv *env, const wchar_t *message) 
{
	char* converted = convertFromWideToAscii(message);
	throwException(env, "org/openqa/selenium/NoSuchFrameException", converted);
	delete[] converted;
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
	jclass clazz = env->FindClass("org/openqa/selenium/ie/InternetExplorerDriver");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");

	return env->NewObject(clazz, cId, (jlong) driver);
}

void wait(long millis)
{
	clock_t end = clock() + millis;
	do
	{
		MSG msg;
		if (PeekMessage( &msg, NULL, 0, 0, PM_REMOVE)) {
			TranslateMessage(&msg); 
			DispatchMessage(&msg); 
		}
		Sleep(0);
	} while (clock() < end);
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

long getLengthOf(SAFEARRAY* ary)
{
	if (!ary)
		return 0;

	long lower = 0;
	SafeArrayGetLBound(ary, 1, &lower);
	long upper = 0;
	SafeArrayGetUBound(ary, 1, &upper);
	return 1 + upper - lower;
}
