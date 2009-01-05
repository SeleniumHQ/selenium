/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

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
