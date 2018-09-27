all: server1-cert.pem server2-cert.pem proxy1-cert.pem proxy2-cert.pem client1-cert.pem client2-cert.pem


#
# Create Certificate Authority: ca1
# ('password' is used for the CA password.)
#
ca1-cert.pem: ca1.cnf
	openssl req -new -x509 -days 9999 -config ca1.cnf -keyout ca1-key.pem -out ca1-cert.pem

#
# Create Certificate Authority: ca2
# ('password' is used for the CA password.)
#
ca2-cert.pem: ca2.cnf
	openssl req -new -x509 -days 9999 -config ca2.cnf -keyout ca2-key.pem -out ca2-cert.pem

#
# Create Certificate Authority: ca3
# ('password' is used for the CA password.)
#
ca3-cert.pem: ca3.cnf
	openssl req -new -x509 -days 9999 -config ca3.cnf -keyout ca3-key.pem -out ca3-cert.pem

#
# Create Certificate Authority: ca4
# ('password' is used for the CA password.)
#
ca4-cert.pem: ca4.cnf
	openssl req -new -x509 -days 9999 -config ca4.cnf -keyout ca4-key.pem -out ca4-cert.pem


#
# server1 is signed by ca1.
#
server1-key.pem:
	openssl genrsa -out server1-key.pem 1024

server1-csr.pem: server1.cnf server1-key.pem
	openssl req -new -config server1.cnf -key server1-key.pem -out server1-csr.pem

server1-cert.pem: server1-csr.pem ca1-cert.pem ca1-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in server1-csr.pem \
		-CA ca1-cert.pem \
		-CAkey ca1-key.pem \
		-CAcreateserial \
		-out server1-cert.pem

#
# server2 is signed by ca1.
#
server2-key.pem:
	openssl genrsa -out server2-key.pem 1024

server2-csr.pem: server2.cnf server2-key.pem
	openssl req -new -config server2.cnf -key server2-key.pem -out server2-csr.pem

server2-cert.pem: server2-csr.pem ca1-cert.pem ca1-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in server2-csr.pem \
		-CA ca1-cert.pem \
		-CAkey ca1-key.pem \
		-CAcreateserial \
		-out server2-cert.pem

server2-verify: server2-cert.pem ca1-cert.pem
	openssl verify -CAfile ca1-cert.pem server2-cert.pem

#
# proxy1 is signed by ca2.
#
proxy1-key.pem:
	openssl genrsa -out proxy1-key.pem 1024

proxy1-csr.pem: proxy1.cnf proxy1-key.pem
	openssl req -new -config proxy1.cnf -key proxy1-key.pem -out proxy1-csr.pem

proxy1-cert.pem: proxy1-csr.pem ca2-cert.pem ca2-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in proxy1-csr.pem \
		-CA ca2-cert.pem \
		-CAkey ca2-key.pem \
		-CAcreateserial \
		-out proxy1-cert.pem

#
# proxy2 is signed by ca2.
#
proxy2-key.pem:
	openssl genrsa -out proxy2-key.pem 1024

proxy2-csr.pem: proxy2.cnf proxy2-key.pem
	openssl req -new -config proxy2.cnf -key proxy2-key.pem -out proxy2-csr.pem

proxy2-cert.pem: proxy2-csr.pem ca2-cert.pem ca2-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in proxy2-csr.pem \
		-CA ca2-cert.pem \
		-CAkey ca2-key.pem \
		-CAcreateserial \
		-out proxy2-cert.pem

proxy2-verify: proxy2-cert.pem ca2-cert.pem
	openssl verify -CAfile ca2-cert.pem proxy2-cert.pem

#
# client1 is signed by ca3.
#
client1-key.pem:
	openssl genrsa -out client1-key.pem 1024

client1-csr.pem: client1.cnf client1-key.pem
	openssl req -new -config client1.cnf -key client1-key.pem -out client1-csr.pem

client1-cert.pem: client1-csr.pem ca3-cert.pem ca3-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in client1-csr.pem \
		-CA ca3-cert.pem \
		-CAkey ca3-key.pem \
		-CAcreateserial \
		-out client1-cert.pem

#
# client2 is signed by ca4.
#
client2-key.pem:
	openssl genrsa -out client2-key.pem 1024

client2-csr.pem: client2.cnf client2-key.pem
	openssl req -new -config client2.cnf -key client2-key.pem -out client2-csr.pem

client2-cert.pem: client2-csr.pem ca4-cert.pem ca4-key.pem
	openssl x509 -req \
		-days 9999 \
		-passin "pass:password" \
		-in client2-csr.pem \
		-CA ca4-cert.pem \
		-CAkey ca4-key.pem \
		-CAcreateserial \
		-out client2-cert.pem


clean:
	rm -f *.pem *.srl

test: client-verify server2-verify proxy1-verify proxy2-verify client-verify
