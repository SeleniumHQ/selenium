#include "stdafx.h"
#include "utils.h"
#include "HtmlNode.h"
#include "com_thoughtworks_webdriver_ie_HtmlNode.h"

HtmlNode* getNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (HtmlNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_HtmlNode_getDocument
  (JNIEnv *env, jobject obj)
{
	HtmlNode* node = getNode(env, obj);
	node->useDocument();
	return obj;
}

#ifdef __cplusplus
}
#endif

