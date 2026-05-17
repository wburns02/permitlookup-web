# storms.ecbtx.com — DNS setup

The Storm Strike Dispatch page is live at `hail.ecbtx.com/roofers` today.
DNS-side, we still need a dedicated `storms.ecbtx.com` (or
`roofers.ecbtx.com`) hostname so the page renders at the apex of its own
subdomain with the roofers-flavoured header. The layout already detects
`storms.*` and `roofers.*` hosts and switches `SiteHeaderVariant` to
`roofers` automatically.

Until DNS lands, point customers at:

```
https://hail.ecbtx.com/roofers
```

## Cloudflare record (mirrors the existing `hail.ecbtx.com` setup)

| Field    | Value                                  |
| -------- | -------------------------------------- |
| Type     | `CNAME`                                |
| Name     | `storms`                               |
| Target   | `cname.vercel-dns.com`                 |
| Proxy    | **DNS only** (gray cloud, not orange)  |
| TTL      | Auto                                   |

Proxy must be **off** — Vercel terminates SSL itself, and putting
Cloudflare in front of it would cause an SSL handshake loop. The current
`hail.ecbtx.com` record (dig CNAME → `cname.vercel-dns.com`) is the
exact reference shape.

## After adding the record

1. Add the alias on Vercel: `vercel alias set <deployment-url> storms.ecbtx.com`
   (or use the Vercel dashboard → Project → Domains).
2. Wait ~30 seconds for Cloudflare DNS to propagate.
3. Verify:

```bash
dig +short storms.ecbtx.com
# Expect: cname.vercel-dns.com.  76.76.21.x
curl -sI "https://storms.ecbtx.com/" | head -3
# Expect: HTTP/2 200
curl -s "https://storms.ecbtx.com/" | grep -c "Storm Strike"
# Expect: > 0  (the roofers/page.tsx is the apex page for this host)
```

## Optional second hostname

If you also want `roofers.ecbtx.com`, add an identical CNAME with
`Name = roofers`. The layout treats both as the same variant.

## Alternative (apex A record, if Cloudflare CNAME fails)

| Field    | Value           |
| -------- | --------------- |
| Type     | `A`             |
| Name     | `storms`        |
| Target   | `76.76.21.21`   |
| Proxy    | DNS only        |
| TTL      | Auto            |

Either form works. CNAME is preferred so we don't need to chase IP changes.
