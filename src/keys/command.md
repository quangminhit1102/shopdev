```shell
> openssl genrsa -out private_key.pem 2048
```

```text
-----BEGIN RSA PRIVATE KEY-----
example
-----END RSA PRIVATE KEY-----
```

```shell
> openssl rsa -pubout -in private_key.pem -out public_key.pem
```

```text
-----BEGIN PUBLIC KEY-----
example
-----END PUBLIC KEY-----

```
