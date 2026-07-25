# Security Policy

## Supported versions

Security fixes are applied to the latest source version on the default branch.

## Reporting a vulnerability

Please do not publish exploitable details in a public issue.

Use GitHub's private vulnerability-reporting feature for this repository. If
private reporting is not available, open a public issue containing only a short
request for a private contact channel and no sensitive technical details.

Include:

- the affected component and version;
- clear reproduction steps;
- the expected impact;
- whether the issue requires local-network access; and
- any suggested mitigation.

## Deployment boundary

Beam Companion Server is intended for trusted local networks. It has no
authentication layer and must not be exposed directly to the public Internet.
