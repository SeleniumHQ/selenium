#include "StdAfx.h"
#include "EventReleaser.h"
#include "utils.h"

EventReleaser::EventReleaser(HANDLE event, bool releaseOnDestructor) : 
	m_event(event), m_releaseOnDestructor(releaseOnDestructor)
{
}

EventReleaser::~EventReleaser(void)
{
	if(m_releaseOnDestructor) {
		if(NULL == m_event) return;
		safeIO::CoutA("Release synchronization flag", true);
		SetEvent(m_event);
	}
}

