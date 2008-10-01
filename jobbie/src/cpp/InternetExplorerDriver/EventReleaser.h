#ifndef JOBBIE_EVENTRELEASER_H_
#define JOBBIE_EVENTRELEASER_H_

class EventReleaser
{
public:
	HANDLE m_event;
	bool m_releaseOnDestructor;
	EventReleaser(HANDLE event, bool m_releaseOnDestructor = true);
public:
	~EventReleaser(void);
};

#endif // JOBBIE_EVENTRELEASER_H_
