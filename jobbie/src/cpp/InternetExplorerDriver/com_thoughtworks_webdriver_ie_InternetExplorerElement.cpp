#include <ExDisp.h>
#include "stdafx.h"
#include "utils.h"
#include "ElementWrapper.h"
#include <iostream>

using namespace std;

#ifdef __cplusplus
extern "C" {
#endif

ElementWrapper* getWrapper(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (ElementWrapper *) value;
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_InternetExplorerElement_getValue
  (JNIEnv *env, jobject obj)
{
	ElementWrapper *wrapper = getWrapper(env, obj);
	const char *value = wrapper->getValue();
	return env->NewStringUTF(value);
}

#ifdef __cplusplus
}
#endif