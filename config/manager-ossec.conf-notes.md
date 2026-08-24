# Manager `ossec.conf` (wazuh-server)

Confirmed live on 24 Aug 2026 via `sudo cat /var/ossec/etc/ossec.conf`.

This file is **effectively stock** — the default Ubuntu 24.04 Wazuh manager
config, unmodified except that it already points to our custom rules via
the standard mechanism:

```xml
<ruleset>
  <rule_dir>etc/rules</rule_dir>
</ruleset>
```

All of this project's actual custom detection logic lives in
[`../rules/local_rules.xml`](../rules/local_rules.xml), not here. No
project-specific `<syscheck>` block exists on the manager — file
integrity monitoring is configured per-*agent* (see the two files in
this folder), not on the manager itself.

Not including the full manager `ossec.conf` in this repo since it's
unmodified default configuration and adds no information about what
we actually built.
