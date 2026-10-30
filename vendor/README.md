# Vendored dependencies

## SheetJS CE 0.20.3

`xlsx-0.20.3.tgz` is the unmodified official SheetJS Community Edition package:

- Source: https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
- Installation guidance: https://docs.sheetjs.com/docs/getting-started/installation/nodejs/
- License: Apache-2.0; license files are included in the tarball.

The npm registry's `xlsx` package remains at 0.18.5. The official 0.20.3 package
contains fixes for CVE-2023-30533 and CVE-2024-22363. Keeping the fixed tarball
locally follows the upstream vendoring guidance and avoids pnpm 10.34.9's missing
integrity error when reusing a lockfile entry for the remote tarball.

To update, download a fixed version from the official CDN, verify its package
name/version, update the `file:` dependency in `package.json`, and validate Chinese
CSV/XLSX import, editing, export, and read-back. Keep the upstream license files.
