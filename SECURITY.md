# Security policy

## Reporting a vulnerability

Please report vulnerabilities privately through GitHub: on
[almena-id/docu](https://github.com/almena-id/docu),
open the **Security** tab and choose **Report a vulnerability**. Do not open a
public issue, pull request or discussion about it.

Include what you can of:

- the version or commit, and the browser if relevant;
- what an attacker can do, and under which configuration;
- steps or a proof of concept to reproduce it.

We aim to acknowledge a report within 3 working days and to agree on a
disclosure date with you once the issue is understood. We credit reporters in
the release notes unless you prefer otherwise.

## Supported versions

The project is before its first release: only the `main` branch receives
security fixes.

## Scope

In scope, among others:

- cross-site scripting or other injection in the built pages;
- the nginx configuration of the Docker image (headers, paths it serves);
- third-party requests from the visitor's browser (fonts, scripts, images)
  that the site should serve itself;
- secrets or internal data published in `dist/`;
- documented procedures that, followed as written, leave a deployment or a
  wallet insecure.

Out of scope:

- the development setup (`task dev`, `task preview`, `.env.example`);
- issues in the platform itself (api, registry, wallet, mediator…): report
  them in their own repository;
- denial of service through sheer traffic volume.
