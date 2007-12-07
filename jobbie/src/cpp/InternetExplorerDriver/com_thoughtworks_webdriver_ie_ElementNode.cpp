#include "stdafx.h"
#include <ExDisp.h>
#include "utils.h"
#include "ElementNode.h"
#include "DocumentNode.h"

using namespace std;

// Define it here, so we know about it
AbstractNode* getAbstractNode(JNIEnv *env, jobject obj);

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getFirstAttribute
  (JNIEnv *env, jobject obj)
{
	Node* node = getAbstractNode(env, obj);
	try {
		Node* attribute = node->getFirstAttribute();
		if (attribute == NULL) 
			return NULL;

		jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/AttributeNode");
		jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
		return env->NewObject(clazz, cId, (jlong) attribute);
	} catch (const char* message) {
		throwNoSuchElementException(env, message);
	}
	return NULL;
}

#ifdef __cplusplus
}
#endif