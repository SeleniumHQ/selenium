#ifndef utils_h
#define utils_h

#include <jni.h>

void throwRunTimeException(JNIEnv *, const char *message);
void throwNoSuchElementException(JNIEnv *, const char *message);
void startCom();
const char *bstr2char(const BSTR toConvert);
const char *variant2char(const VARIANT toConvert);

#endif