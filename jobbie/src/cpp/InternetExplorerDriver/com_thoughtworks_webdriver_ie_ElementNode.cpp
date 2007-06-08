#include <ExDisp.h>
#include "stdafx.h"
#include "utils.h"
#include "ElementNode.h"
#include "DocumentNode.h"

using namespace std;

ElementNode* getElementNode(JNIEnv *env, jobject obj)
{
	jclass cls = env->GetObjectClass(obj);
	jfieldID fid = env->GetFieldID(cls, "nodePointer", "J");
	jlong value = env->GetLongField(obj, fid);

	return (ElementNode *) value;
}

#ifdef __cplusplus
extern "C" {
#endif

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getDocument
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	DocumentNode* doc = (DocumentNode*)node->getDocument();

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/DocumentNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) doc);
}

JNIEXPORT jboolean JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_hasNextChild
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	return (jboolean) node->hasNextChild();
}

JNIEXPORT jobject JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_nextChild
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	Node* child = node->getNextChild();
	if (child == NULL)
		return NULL;

	//cout << "ElementNode next child: " << child->name() << endl;

	jclass clazz = env->FindClass("com/thoughtworks/webdriver/ie/ElementNode");
	jmethodID cId = env->GetMethodID(clazz, "<init>", "(J)V");
	return env->NewObject(clazz, cId, (jlong) child);
}

JNIEXPORT jstring JNICALL Java_com_thoughtworks_webdriver_ie_ElementNode_getName
  (JNIEnv *env, jobject obj)
{
	ElementNode* node = getElementNode(env, obj);
	const char* name = node->name();

	return env->NewStringUTF(name);
}

#ifdef __cplusplus
}
#endif