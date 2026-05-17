# broadband.ecbtx.com — DNS setup

The Vercel project alias has been added — only the Cloudflare DNS record is
still missing. After adding the record below, propagation takes ~30 seconds
and `https://broadband.ecbtx.com/` will start serving the Next.js
`/broadband` page (the layout already detects the `broadband.*` host).

## Cloudflare record (mirrors the existing `hail.ecbtx.com` setup)

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Type     | `CNAME`                                |
| Name     | `broadband`                            |
| Target   | `cname.vercel-dns.com`                 |
| Proxy    | **DNS only** (gray cloud, not orange)  |
| TTL      | Auto                                   |

Proxy must be **off** — Vercel terminates SSL itself, and putting Cloudflare
in front of it would cause an SSL handshake loop. The current
`hail.ecbtx.com` record (dig CNAME → `cname.vercel-dns.com`) is the
exact reference shape.

## Alternative (if you'd rather use the apex A record Vercel suggests)

| Field    | Value           |
| -------- | --------------- |
| Type     | `A`             |
| Name     | `broadband`     |
| Target   | `76.76.21.21`   |
| Proxy    | DNS only        |
| TTL      | Auto            |

Either form works. CNAME is preferred so we don't need to chase IP changes.

## Verify after adding

```bash
dig +short broadband.ecbtx.com
# Expect: cname.vercel-dns.com.  76.76.21.x
curl -sI "https://broadband.ecbtx.com/" | head -3
# Expect: HTTP/2 200
curl -s "https://broadband.ecbtx.com/" | grep -c "Broadband Coverage API"
# Expect: > 0
```
