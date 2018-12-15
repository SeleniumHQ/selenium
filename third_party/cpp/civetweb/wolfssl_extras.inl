/* Additional defines for WolfSSL, see
 * https://github.com/civetweb/civetweb/issues/583 */


/* Required for WOLFSSL_X509 */
#include <openssl/../internal.h>


#define i2d_X509 cw_i2d_X509
#define EVP_Digest cw_EVP_Digest


/* i2d_X509 has no valid implementation in wolfssl
 *
 * The letters i and d in for example i2d_X509 stand for "internal" (that is an
 *internal C structure)
 * and " DER ". So that i2d_X509 converts from internal to DER.
 *
 * For OpenSSL 0.9.7 and later if *out is NULL memory will be allocated for a
 *buffer and the encoded
 * data written to it. In this case *out is not incremented and it points to the
 *start of the data
 * just written.
 */
int
cw_i2d_X509(struct WOLFSSL_X509 *x, unsigned char **out)
{
	if (!x || !x->derCert) {
		return -1;
	}

	const int ret = (int)x->derCert->length;

	if (out && (ret > 0)) {
		if (*out == NULL) {
			*out = mg_malloc(ret);
		}
		if (*out != NULL) {
			memcpy(*out, x->derCert->buffer, ret);
		}
	}

	return ret;
}


/* EVP_Digest not in wolfssl */
int
cw_EVP_Digest(const void *data,
              size_t count,
              unsigned char *md,
              unsigned int *size,
              const EVP_MD *type,
              ENGINE *impl)
{
	EVP_MD_CTX *ctx = EVP_MD_CTX_new();
	int ret;

	if (ctx == NULL)
		return 0;

	/* EVP_MD_CTX_set_flags(ctx, EVP_MD_CTX_FLAG_ONESHOT); */
	ret = EVP_DigestInit_ex(ctx, type, impl)
	      && EVP_DigestUpdate(ctx, data, count)
	      && EVP_DigestFinal_ex(ctx, md, size);
	EVP_MD_CTX_free(ctx);

	return ret;
}


/*
 * the variable SSL_OP_NO_TLSv1_1 is not defined within the context of
 * wolfssl but since the methods using the value are all stubs, we can
 * define it arbitrarily and it will not have any consequences
 */
#define SSL_OP_NO_TLSv1_1 (0x10000000L)
