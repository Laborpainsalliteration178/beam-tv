# Contributing to Beam

Thank you for helping improve Beam.

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
