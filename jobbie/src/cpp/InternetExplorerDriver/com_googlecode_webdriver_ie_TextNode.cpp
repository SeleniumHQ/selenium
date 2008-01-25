#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "TextNode.h"
#include "DocumentNode.h"

using namespace std;

// Define it here, so we know about it
AbstractNode* getAbstractNode(JNIEnv *env, jobject obj);

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_googlecode_webdriver_ie_TextNode_getFirstAttribute
  (JNIEnv *env, jobject obj)
{
	return NULL;
}

#ifdef __cplusplus
}
#endif