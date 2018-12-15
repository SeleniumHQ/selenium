/* Experimental implementation for on-the-fly compression */
#if !defined(USE_ZLIB)
#error "This file must only be included, if USE_ZLIB is set"
#endif

#include "zconf.h"
#include "zlib.h"

#if !defined(MEM_LEVEL)
#define MEM_LEVEL (8)
#endif

static void *
zalloc(void *opaque, uInt items, uInt size)
{
	struct mg_connection *conn = (struct mg_connection *)opaque;
	void *ret = mg_calloc_ctx(items, size, conn->phys_ctx);

	return ret;
}


static void
zfree(void *opaque, void *address)
{
	struct mg_connection *conn = (struct mg_connection *)opaque;
	(void)conn; /* not required */

	mg_free(address);
}


static void
send_compressed_data(struct mg_connection *conn, struct mg_file *filep)
{

	int zret;
	z_stream zstream;
	int do_flush;
	unsigned bytes_avail;
	unsigned char in_buf[MG_BUF_LEN];
	unsigned char out_buf[MG_BUF_LEN];
	FILE *in_file = filep->access.fp;

	/* Prepare state buffer. User server context memory allocation. */
	memset(&zstream, 0, sizeof(zstream));
	zstream.zalloc = zalloc;
	zstream.zfree = zfree;
	zstream.opaque = (void *)conn;

	/* Initialize for GZIP compression (MAX_WBITS | 16) */
	zret = deflateInit2(&zstream,
	                    Z_BEST_COMPRESSION,
	                    Z_DEFLATED,
	                    MAX_WBITS | 16,
	                    MEM_LEVEL,
	                    Z_DEFAULT_STRATEGY);

	if (zret != Z_OK) {
		mg_cry_internal(conn,
		                "GZIP init failed (%i): %s",
		                zret,
		                (zstream.msg ? zstream.msg : "<no error message>"));
		deflateEnd(&zstream);
		return;
	}

	/* Read until end of file */
	do {
		zstream.avail_in = fread(in_buf, 1, MG_BUF_LEN, in_file);
		if (ferror(in_file)) {
			mg_cry_internal(conn, "fread failed: %s", strerror(ERRNO));
			(void)deflateEnd(&zstream);
			return;
		}

		do_flush = (feof(in_file) ? Z_FINISH : Z_NO_FLUSH);
		zstream.next_in = in_buf;

		/* run deflate() on input until output buffer not full, finish
		 * compression if all of source has been read in */
		do {
			zstream.avail_out = MG_BUF_LEN;
			zstream.next_out = out_buf;
			zret = deflate(&zstream, do_flush);

			if (zret == Z_STREAM_ERROR) {
				/* deflate error */
				zret = -97;
				break;
			}

			bytes_avail = MG_BUF_LEN - zstream.avail_out;
			if (bytes_avail) {
				if (mg_send_chunk(conn, (char *)out_buf, bytes_avail) < 0) {
					zret = -98;
					break;
				}
			}

		} while (zstream.avail_out == 0);

		if (zret < -90) {
			/* Forward write error */
			break;
		}

		if (zstream.avail_in != 0) {
			/* all input will be used, otherwise GZIP is incomplete */
			zret = -99;
			break;
		}

		/* done when last data in file processed */
	} while (do_flush != Z_FINISH);

	if (zret != Z_STREAM_END) {
		/* Error: We did not compress everything. */
		mg_cry_internal(conn,
		                "GZIP incomplete (%i): %s",
		                zret,
		                (zstream.msg ? zstream.msg : "<no error message>"));
	}

	deflateEnd(&zstream);

	/* Send "end of chunked data" marker */
	mg_write(conn, "0\r\n\r\n", 5);
}
