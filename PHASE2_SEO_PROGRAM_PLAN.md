# Phase 2 SEO Program Plan (Post Listing URL Migration)

## Summary
This plan covers SEO workstreams **after** the listing URL migration plan.

Goal in plain language:
- Keep the URL migration gains.
- Prevent technical SEO regressions.
- Improve organic visibility with a practical rollout based on team bandwidth.

This is a planning document only. No implementation is included.

## Priority Framework
- **High**: Biggest impact or risk reduction; should be scheduled first.
- **Medium**: Important improvements after core stability is in place.
- **Later**: Valuable but not urgent for immediate SEO performance.

---

## High Priority

### 1) Robots and Crawl Control
What this means in plain language:
- Tell search engines clearly which pages should be crawled and which should not.
- Prevent crawler time from being wasted on low-value pages (filters, duplicates, utility URLs).

Why this is high:
- Even strong pages can underperform if crawlers spend time in the wrong areas.
- Reduces indexing noise and duplicate URL risks.

Success criteria:
- Clear, intentional `robots.txt` rules.
- No accidental blocking of key listing and content pages.
- Reduced crawl waste on non-SEO pages.

---

### 2) Automated Technical SEO QA in CI
What this means in plain language:
- Add checks that fail builds when canonical tags, redirects, sitemap entries, or metadata break.

Why this is high:
- Manual checks miss regressions.
- SEO bugs often ship silently and hurt traffic before anyone notices.

Success criteria:
- Build fails on broken canonical/redirect/sitemap rules.
- Core SEO rules are tested on every release.

---

### 3) Core Web Vitals and Performance Baseline
What this means in plain language:
- Improve speed and stability so users and search engines get faster pages.

Why this is high:
- Slow pages reduce rankings and conversion.
- Performance gains improve both SEO and user experience.

Success criteria:
- Defined baseline and target for LCP, CLS, and INP.
- Priority page templates (home, listings, listing detail) meet agreed thresholds.

---

### 4) SEO Monitoring and Alerting
What this means in plain language:
- Set up a lightweight system to catch drops in indexed pages, crawl errors, and redirect issues early.

Why this is high:
- You cannot protect SEO if failures are discovered weeks later.
- Monitoring protects traffic after each deployment.

Success criteria:
- Weekly SEO health dashboard.
- Alerts for spikes in 404s, redirect failures, and indexing anomalies.

---

## Medium Priority

### 5) Internal Linking Architecture
What this means in plain language:
- Improve how pages link to each other so important pages are easier for users and search engines to reach.

Why this is medium:
- Strong internal linking boosts discoverability and authority flow.
- Usually comes after core technical stability.

Success criteria:
- Clear breadcrumb consistency.
- Related listing/content modules with intentional linking logic.
- Reduced click depth to key listing pages.

---

### 6) Image SEO Program
What this means in plain language:
- Ensure listing and content images are optimized with useful alt text, proper sizing, and efficient loading.

Why this is medium:
- Real estate sites depend heavily on images.
- Better image SEO helps both page performance and image-search visibility.

Success criteria:
- Alt text quality standard applied.
- Large images optimized consistently.
- Improved image-related performance and crawl efficiency.

---

### 7) On-Page SEO Standards (Template Governance)
What this means in plain language:
- Standardize title tags, meta descriptions, and page copy patterns to avoid weak or duplicate SEO text.

Why this is medium:
- Prevents thin/duplicated metadata at scale.
- Improves click-through from search results.

Success criteria:
- Approved templates for key page types.
- Duplicate/low-quality metadata rate reduced.

---

### 8) Structured Data Expansion
What this means in plain language:
- Beyond listing URL alignment, expand schema coverage where valid (example: breadcrumbs, organization-level schema).

Why this is medium:
- Helps search engines interpret site structure and page intent.
- Adds incremental SEO value when implemented correctly.

Success criteria:
- Valid schema on target templates.
- No recurring structured data errors in Search Console.

---

## Later Priority

### 9) Local SEO Expansion
What this means in plain language:
- Strengthen location relevance signals (city/area targeting strategy, local entity consistency).

Why this is later:
- Useful growth lever, but should follow technical and template stability.

Success criteria:
- Clear local landing strategy and coverage map.
- Better visibility on city/location intent queries.

---

### 10) Off-Page SEO and Authority Program
What this means in plain language:
- Build credible external references and backlinks over time.

Why this is later:
- High effort and ongoing.
- Works best once on-site technical SEO is stable.

Success criteria:
- Growth in quality referring domains.
- Improved rankings for competitive transactional terms.

---

### 11) International/Multilingual SEO (If Needed)
What this means in plain language:
- If multiple languages/regions are planned, add proper language targeting to avoid duplicate content confusion.

Why this is later:
- Only needed when multilingual rollout is in scope.

Success criteria:
- Correct language/region targeting strategy.
- No cross-language indexing conflicts.

---

## Recommended Rollout Sequence

### Wave A (Immediate, 2-6 weeks)
- Robots and crawl control
- Automated technical SEO QA in CI
- Core Web Vitals baseline + quick wins
- SEO monitoring and alerts

Plain-language outcome:
- You protect existing traffic and reduce breakage risk quickly.

### Wave B (Next, 4-10 weeks)
- Internal linking architecture
- Image SEO program
- On-page SEO standards
- Structured data expansion

Plain-language outcome:
- You improve discoverability and result quality across more pages.

### Wave C (Longer horizon)
- Local SEO expansion
- Off-page authority program
- International SEO (if product direction requires it)

Plain-language outcome:
- You shift from technical stability to broader growth and market expansion.

## Dependencies and Guardrails
- Complete Phase 1 listing URL migration validation before starting Wave B.
- Keep canonical/redirect/sitemap rules as non-negotiable constraints.
- Any future SEO feature must not introduce multiple indexable URLs for the same content.

## Team Bandwidth Guidance (Practical)
- Small team: run Wave A first, then pick 1-2 Wave B items.
- Medium team: run full Wave A + Wave B in parallel tracks.
- Larger team: run Wave A and B concurrently with dedicated owners, then begin Wave C discovery.

## Definition of Done for Phase 2 Planning
- Priorities are agreed (`High / Medium / Later`).
- Work is sequenced into waves with dependencies.
- Success criteria are defined for each category.
- Monitoring plan exists before broader SEO expansion begins.
