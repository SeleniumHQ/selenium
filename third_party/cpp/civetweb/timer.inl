/* This file is part of the CivetWeb web server.
 * See https://github.com/civetweb/civetweb/
 * (C) 2014-2018 by the CivetWeb authors, MIT license.
 */

#if !defined(MAX_TIMERS)
#define MAX_TIMERS MAX_WORKER_THREADS
#endif

typedef int (*taction)(void *arg);

struct ttimer {
	double time;
	double period;
	taction action;
	void *arg;
};

struct ttimers {
	pthread_t threadid;               /* Timer thread ID */
	pthread_mutex_t mutex;            /* Protects timer lists */
	struct ttimer timers[MAX_TIMERS]; /* List of timers */
	unsigned timer_count;             /* Current size of timer list */
};


TIMER_API double
timer_getcurrenttime(void)
{
#if defined(_WIN32)
	/* GetTickCount returns milliseconds since system start as
	 * unsigned 32 bit value. It will wrap around every 49.7 days.
	 * We need to use a 64 bit counter (will wrap in 500 mio. years),
	 * by adding the 32 bit difference since the last call to a
	 * 64 bit counter. This algorithm will only work, if this
	 * function is called at least once every 7 weeks. */
	static DWORD last_tick;
	static uint64_t now_tick64;

	DWORD now_tick = GetTickCount();

	now_tick64 += ((DWORD)(now_tick - last_tick));
	last_tick = now_tick;
	return (double)now_tick64 * 1.0E-3;
#else
	struct timespec now_ts;

	clock_gettime(CLOCK_MONOTONIC, &now_ts);
	return (double)now_ts.tv_sec + (double)now_ts.tv_nsec * 1.0E-9;
#endif
}


TIMER_API int
timer_add(struct mg_context *ctx,
          double next_time,
          double period,
          int is_relative,
          taction action,
          void *arg)
{
	unsigned u, v;
	int error = 0;
	double now;

	if (ctx->stop_flag) {
		return 0;
	}

	now = timer_getcurrenttime();

	/* HCP24: if is_relative = 0 and next_time < now
	 *        action will be called so fast as possible
	 *        if additional period > 0
	 *        action will be called so fast as possible
	 *        n times until (next_time + (n * period)) > now
	 *        then the period is working
	 * Solution:
	 *        if next_time < now then we set next_time = now.
	 *        The first callback will be so fast as possible (now)
	 *        but the next callback on period
	 */
	if (is_relative) {
		next_time += now;
	}

	/* You can not set timers into the past */
	if (next_time < now) {
		next_time = now;
	}

	pthread_mutex_lock(&ctx->timers->mutex);
	if (ctx->timers->timer_count == MAX_TIMERS) {
		error = 1;
	} else {
		/* Insert new timer into a sorted list. */
		/* The linear list is still most efficient for short lists (small
		 * number of timers) - if there are many timers, different
		 * algorithms will work better. */
		for (u = 0; u < ctx->timers->timer_count; u++) {
			if (ctx->timers->timers[u].time > next_time) {
				/* HCP24: moving all timers > next_time */
				for (v = ctx->timers->timer_count; v > u; v--) {
					ctx->timers->timers[v] = ctx->timers->timers[v - 1];
				}
				break;
			}
		}
		ctx->timers->timers[u].time = next_time;
		ctx->timers->timers[u].period = period;
		ctx->timers->timers[u].action = action;
		ctx->timers->timers[u].arg = arg;
		ctx->timers->timer_count++;
	}
	pthread_mutex_unlock(&ctx->timers->mutex);
	return error;
}


static void
timer_thread_run(void *thread_func_param)
{
	struct mg_context *ctx = (struct mg_context *)thread_func_param;
	double d;
	unsigned u;
	int re_schedule;
	struct ttimer t;

	mg_set_thread_name("timer");

	if (ctx->callbacks.init_thread) {
		/* Timer thread */
		ctx->callbacks.init_thread(ctx, 2);
	}

	d = timer_getcurrenttime();

	while (ctx->stop_flag == 0) {
		pthread_mutex_lock(&ctx->timers->mutex);
		if ((ctx->timers->timer_count > 0)
		    && (d >= ctx->timers->timers[0].time)) {
			t = ctx->timers->timers[0];
			for (u = 1; u < ctx->timers->timer_count; u++) {
				ctx->timers->timers[u - 1] = ctx->timers->timers[u];
			}
			ctx->timers->timer_count--;
			pthread_mutex_unlock(&ctx->timers->mutex);
			re_schedule = t.action(t.arg);
			if (re_schedule && (t.period > 0)) {
				timer_add(ctx, t.time + t.period, t.period, 0, t.action, t.arg);
			}
			continue;
		} else {
			pthread_mutex_unlock(&ctx->timers->mutex);
		}

/* 10 ms seems reasonable.
 * A faster loop (smaller sleep value) increases CPU load,
 * a slower loop (higher sleep value) decreases timer accuracy.
 */
#if defined(_WIN32)
		Sleep(10);
#else
		usleep(10000);
#endif

		d = timer_getcurrenttime();
	}

	pthread_mutex_lock(&ctx->timers->mutex);
	ctx->timers->timer_count = 0;
	pthread_mutex_unlock(&ctx->timers->mutex);
}


#if defined(_WIN32)
static unsigned __stdcall timer_thread(void *thread_func_param)
{
	timer_thread_run(thread_func_param);
	return 0;
}
#else
static void *
timer_thread(void *thread_func_param)
{
	struct sigaction sa;

	/* Ignore SIGPIPE */
	memset(&sa, 0, sizeof(sa));
	sa.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sa, NULL);

	timer_thread_run(thread_func_param);
	return NULL;
}
#endif /* _WIN32 */


TIMER_API int
timers_init(struct mg_context *ctx)
{
	/* Initialize timers data structure */
	ctx->timers =
	    (struct ttimers *)mg_calloc_ctx(sizeof(struct ttimers), 1, ctx);

	if (!ctx->timers) {
		return -1;
	}

	/* Initialize mutex */
	if (0 != pthread_mutex_init(&ctx->timers->mutex, NULL)) {
		mg_free((void *)(ctx->timers));
		return -1;
	}

	/* For some systems timer_getcurrenttime does some initialization
	 * during the first call. Call it once now, ignore the result. */
	(void)timer_getcurrenttime();

	/* Start timer thread */
	mg_start_thread_with_id(timer_thread, ctx, &ctx->timers->threadid);

	return 0;
}


TIMER_API void
timers_exit(struct mg_context *ctx)
{
	if (ctx->timers) {
		pthread_mutex_lock(&ctx->timers->mutex);
		ctx->timers->timer_count = 0;

		mg_join_thread(ctx->timers->threadid);

		/* TODO: Do we really need to unlock the mutex, before
		 * destroying it, if it's destroyed by the thread currently
		 * owning the mutex? */
		pthread_mutex_unlock(&ctx->timers->mutex);
		(void)pthread_mutex_destroy(&ctx->timers->mutex);
		mg_free(ctx->timers);
	}
}


/* End of timer.inl */
