---
title: "Hardening this Site: Cloudflare + Astro"
description: "Technical breakdown of security headers, WAF rules, and static site architecture for defense in depth."
pubDate: 2026-01-15
tags: ["cloudflare", "web-security", "defense-in-depth"]
---

This site runs on Astro deployed to Cloudflare Pages. No servers to patch. No databases to secure. No runtime vulnerabilities to exploit. Here's how I hardened it—and why static sites are inherently more secure.

## Why Static = Secure

Traditional web applications have attack surface everywhere:

- **Server-side code**: SQL injection, command injection, SSRF
- **Runtime dependencies**: Vulnerable libraries, outdated frameworks
- **Database layer**: Data breaches, privilege escalation
- **State management**: Session hijacking, CSRF

Static sites eliminate most of this by design. There's no server-side code to exploit. No database to breach. Every page is pre-rendered HTML served from edge CDN nodes.

The remaining attack surface:
- Client-side JavaScript (minimal)
- CDN/hosting provider (Cloudflare)
- Build pipeline (GitHub Actions)
- DNS infrastructure

## Security Headers Configuration

Every response from this site includes hardened security headers. Here's the configuration in `public/_headers`:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

Let's break these down:

### Content-Security-Policy

CSP is the most powerful header for preventing XSS and data injection attacks.

```
default-src 'self'
```
Base policy: only load resources from same origin.

```
script-src 'self' https://challenges.cloudflare.com
```
JavaScript only from this domain and Cloudflare's Turnstile (for contact form CAPTCHA).

```
style-src 'self' 'unsafe-inline'
```
Styles from this domain. `unsafe-inline` required for Astro's scoped styles—a tradeoff I accept given the controlled environment.

```
frame-ancestors 'none'
```
Prevent this site from being embedded in frames (clickjacking protection).

### HSTS (Strict-Transport-Security)

```
max-age=31536000; includeSubDomains; preload
```

Force HTTPS for one year, including all subdomains. The `preload` directive registers the domain in browser HSTS preload lists—even first-time visitors get HTTPS enforcement.

### Additional Headers

- **X-Frame-Options: DENY** - Redundant clickjacking protection for older browsers
- **X-Content-Type-Options: nosniff** - Prevent MIME-type sniffing attacks
- **Referrer-Policy: strict-origin-when-cross-origin** - Limit referrer information leakage
- **Permissions-Policy** - Disable unused browser features (camera, mic, geolocation)
- **COOP/CORP** - Isolate browsing context, prevent Spectre-like attacks

## Cloudflare WAF Configuration

Beyond headers, Cloudflare provides edge security:

### Managed Rules

Enable Cloudflare Managed Ruleset with:
- OWASP Core Ruleset
- Cloudflare Specials (proprietary threat intelligence)
- Anomaly scoring for suspicious patterns

### Custom Rules

Block obvious attack patterns:

```
(http.request.uri.query contains "SELECT" and http.request.uri.query contains "FROM") or
(http.request.uri.query contains "UNION" and http.request.uri.query contains "SELECT") or
(http.request.uri.query contains "<script") or
(http.request.uri.query contains "javascript:")
```

### Rate Limiting

Protect against brute force and DDoS:

```
Rule: Contact Form Protection
If: URI Path equals "/contact" AND Request Method equals "POST"
Then: Rate limit to 5 requests per minute per IP
Action: Challenge
```

### Bot Management

Configure bot scores:
- Definitely automated (score 1-29): Block
- Likely automated (score 30-49): Challenge
- Likely human (score 50+): Allow

## Build Pipeline Security

The site builds via GitHub Actions. Key security measures:

### Dependency Pinning

```yaml
# astro.config.mjs - Pin exact versions
{
  "dependencies": {
    "astro": "5.0.0",  # Not ^5.0.0
    "@astrojs/sitemap": "3.0.0"
  }
}
```

### Minimal Permissions

```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Dependency Review

```yaml
- name: Dependency Review
  uses: actions/dependency-review-action@v3
  with:
    fail-on-severity: high
```

## DNS Security

### DNSSEC

Enabled via Cloudflare. Prevents DNS spoofing and cache poisoning by cryptographically signing DNS records.

### CAA Records

Certificate Authority Authorization restricts which CAs can issue certificates:

```
virtualpavi.com. CAA 0 issue "digicert.com"
virtualpavi.com. CAA 0 issue "letsencrypt.org"
virtualpavi.com. CAA 0 iodef "mailto:security@virtualpavi.com"
```

## Security.txt

Following RFC 9116, I publish security contact information:

```
# public/.well-known/security.txt
Contact: mailto:security@virtualpavi.ca
Expires: 2027-12-31T23:59:00.000Z
Preferred-Languages: en
Canonical: https://virtualpavi.ca/.well-known/security.txt
```

This provides a standardized way for security researchers to report vulnerabilities.

## Monitoring and Response

### Cloudflare Analytics

Monitor for:
- Unusual traffic spikes (potential DDoS)
- High error rates (potential attacks)
- Geographic anomalies (targeted attacks)

### Security Headers Validation

Regular checks via:
- securityheaders.com
- Mozilla Observatory
- CSP Evaluator

### Subresource Integrity

For any external resources (none currently), implement SRI:

```html
<script 
  src="https://example.com/script.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

## The Result

This configuration achieves:
- **A+ rating** on securityheaders.com
- **A rating** on Mozilla Observatory
- **Zero JavaScript** beyond minimal interactivity
- **No cookies** (privacy by design)
- **No tracking** scripts

Static sites aren't just about performance. They're about reducing attack surface to its minimum. When there's nothing to exploit, defense becomes straightforward.

---

*Questions about hardening your own site? [Reach out](/contact).*
