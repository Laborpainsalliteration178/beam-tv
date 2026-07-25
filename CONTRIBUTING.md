# Contributing to Beam

Thank you for helping improve Beam.

## Find work

Start with the
[`good first issue`](https://github.com/TAGISWILD/beam-tv/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22),
[`help wanted`](https://github.com/TAGISWILD/beam-tv/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22),
or
[`hacktoberfest`](https://github.com/TAGISWILD/beam-tv/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest)
queues.

Before starting:

1. Read the entire issue and its acceptance criteria.
2. Comment with the approach you intend to take.
3. Wait for a maintainer response when the issue involves architecture, a new
   dependency, a protocol change, privacy, or security.
4. Keep one pull request focused on one issue.

## Before opening an issue

- Search existing issues to avoid duplicates.
- Include the Samsung TV model, model year, Tizen version, and firmware version
  when reporting TV-specific behavior.
- For playback problems, include the container, video codec, audio codec, and
  source type (USB or network). Do not upload copyrighted media.
- Remove personal paths, IP addresses, server names, and other private data from
  screenshots and logs.

## Development workflow

1. Fork the repository and create a focused branch.
2. Make the smallest change that solves the problem.
3. Test browser-preview behavior.
4. Test platform-specific changes on a Tizen TV or emulator when possible.
5. Run `npm ci` and start the companion server when changing `beam-server`.
6. Update documentation when behavior or setup changes.
7. Open a pull request describing the change and how it was tested.

## Hacktoberfest

Beam opts in through the `hacktoberfest` repository topic. Hacktoberfest pull
requests must be useful, scoped to a real issue, and meet the same standards as
every other contribution.

- Opening a pull request does not guarantee acceptance.
- Automated formatting-only, generated-noise, duplicate, or unrelated pull
  requests will be closed.
- Do not divide one logical change into several trivial pull requests.
- Maintainers may label low-quality submissions `spam` or `invalid`.
- A qualifying pull request may be merged, approved, or labeled
  `hacktoberfest-accepted` after review.

The event rules can change from year to year. Contributors should verify the
current rules on the official Hacktoberfest website.

## Code guidelines

- Keep the TV application dependency-free unless a dependency is clearly
  justified.
- Preserve remote-only navigation and visible focus behavior.
- Treat USB and shared folders as read-only.
- Avoid adding analytics, advertising, tracking, or external network services.
- Keep local-network behavior explicit and document any new port or protocol.
- Do not commit build output, signing material, media libraries, or credentials.

## Pull-request checklist

- [ ] The TV interface remains usable with directional, OK, and Back keys.
- [ ] No secret, certificate, personal path, or local IP address is included.
- [ ] New persistent data is documented in the privacy policy.
- [ ] User-facing behavior is documented.
- [ ] Testing and hardware limitations are described accurately.

## Community

Be respectful and constructive in issues, discussions, reviews, and pull
requests. Participation is governed by [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
