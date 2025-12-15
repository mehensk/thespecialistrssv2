# Cost Model (PHP) – MVP Assumptions

Indicative monthly/annual costs per broker in Philippine peso (PHP). Assumptions are conservative; replace with your provider’s actual rates.

## Assumptions
- Traffic: pageviews per month as listed below; 300 KB average transfer per page (HTML + assets, excluding large images served via broker’s external URLs).
- CDN egress: PHP 4.0 per GB (example; adjust to your provider).
- Builds: 4 publishes per month per broker; build compute negligible for MVP scale.
- Storage: metadata negligible; images hosted externally (no cost to you).
- SSL/DNS: included in CDN plan.

## Scenarios (per broker)
| Scenario | Pageviews/mo | Data Transfer (GB) | CDN Cost (PHP) | Est. Overhead (PHP) | Total Est. Monthly (PHP) | Annual (PHP, 2 mo off) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Light | 5,000 | ~1.5 GB | ~6 | ~14 | ~20 | ~200 |
| Moderate | 25,000 | ~7.5 GB | ~30 | ~40 | ~70 | ~700 |
| Heavy | 100,000 | ~30 GB | ~120 | ~80 | ~200 | ~2,000 |
| Very Heavy | 500,000 | ~150 GB | ~600 | ~200 | ~800 | ~8,000 |

Notes:
- Overhead covers monitoring/logs/error budget, support time, build bursts. Adjust as you see real usage.
- If you add media hosting/optimization later, bandwidth and storage will dominate; revisit numbers.
- Currency conversion basis: this table assumes direct PHP pricing; rebase if your vendor bills in USD.

## Suggested Pricing (PHP, starting point)
- Monthly: PHP 1,000–2,000 for the MVP feature set (static, manual import, capped sections/listings). This yields healthy margin over even heavy CDN usage.
- Annual: 2 months off is typical → PHP 10,000–20,000 per year.
- Add-ons to justify higher tiers: higher listing caps, media hosting/optimization, analytics dashboard, lead capture upgrades, domain concierge, priority support.

