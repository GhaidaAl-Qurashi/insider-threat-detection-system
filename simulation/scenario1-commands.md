# Scenario 1 — Simulation Commands (Insider Threat)

Insider machine: Employee-Insider (Windows, Tailscale `100.115.168.118`), modeled as an Engineering employee.
Target data: `C:\HR_Confidential\Executive\` (HR/Executive files — outside the insider's job role).
Detection engine: Wazuh 4.14.1 agent → Wazuh manager.

---

### 1. Off-Hours Access — Timing Check

Activity is timed outside normal business hours to simulate an insider avoiding daytime scrutiny.

```powershell
Get-Date
cd "C:\HR_Confidential"
```

> **Expected Wazuh alert:** Rules 100103 / 100104 — off-hours access detected (built on `if_sid 60118` with a custom `<time>` tag).

---

### 2. Privilege Abuse — Accessing Files Outside Job Role

The insider (Engineering) browses into `HR_Confidential\Executive`, a folder they are technically over-permissioned to reach but have never touched before.

> **Expected Wazuh alert:** Built-in FIM Rules 550 / 554 (file access/open/modify), with the "wrong department touching this folder" logic layered on top as the custom detection concept — not a native Wazuh rule.

---

### 3. Data Staging / Tampering

```powershell
New-Item -Path "C:\HR_Confidential\Executive\Exfiltrated_Log.txt" -ItemType File -Value "Data ready for extraction."
Add-Content -Path "C:\HR_Confidential\Executive\Project_Phoenix_DRAFT_v1.xlsx" -Value "Data Tampered by Insider"
Remove-Item "C:\HR_Confidential\Executive\HR-Restructuring-Roster-2026.xlsx" -Force
```

> **Expected Wazuh alert:** FIM Rules 554 (file added), 550 (checksum/content changed), and 553 (file deleted) as each action hits the monitored directory.

---

### 4. Mass File Copy / Staging

```powershell
New-Item -Path "C:\HR_Confidential\Executive\Exfil_Data" -ItemType Directory -Force
Get-ChildItem -Path "C:\HR_Confidential\Executive" -File | Copy-Item -Destination "C:\HR_Confidential\Executive\Exfil_Data" -Force
```

> **Expected Wazuh alert:** Rule 100105 — mass file copy / staging, mapped to MITRE T1074 (Data Staged).

---

### 5. Steganography-Based Exfiltration

```powershell
cd "C:\Tools\OpenStego"
.\openstego.bat embed -mf "C:\HR_Confidential\Executive\Exfil_Data\Project_Phoenix_DRAFT_v1.xlsx" -cf "C:\Images\Cat.png" -sf "C:\HR_Confidential\Executive\Stego_Image.png"
```

> **Expected Wazuh alert:** Rule 100020 — steganography detection (entropy/z-score based, triggered via FIM active-response on the resulting `Stego_Image.png`).

---

### 6. Removable Media — External Drive Exfiltration

```powershell
New-Item -Path "E:\Exfiltrated_Data" -ItemType Directory -Force
Copy-Item -Path "C:\HR_Confidential\Executive\Stego_Image.png" -Destination "E:\Exfiltrated_Data" -Force
```

> **Expected Wazuh alert:** Rule 100021 — removable media use (external hard disk via USB), extended from Wazuh's default USB/removable-media rule.

---

### 7. Log Tampering — Clearing Evidence

```powershell
wevtutil cl Security
```

> **Expected Wazuh alert:** Rule 63104 (log-clearing, level 12) — built on Wazuh's default rule 63103, run last to preserve evidence of the preceding steps before the trail is cleared.

---

### Expected Dashboard Evidence — In Order

| # | Rule / Source | What it means |
|---|---|---|
| 1 | 100103 / 100104 (custom) | Off-hours access detected |
| 2 | FIM 550 / 554 (built-in) | Insider (Engineering) accesses HR/Executive folder outside job role |
| 3 | FIM 554 / 550 / 553 (built-in) | File created, tampered, and deleted in monitored directory |
| 4 | 100105 (custom) | Mass file copy into staging folder (Data Staged, T1074) |
| 5 | 100020 (custom) | Steganography-based exfiltration detected via entropy/z-score analysis |
| 6 | 100021 (custom) | Removable media (external HD via USB) used for exfiltration |
| 7 | 63104 (built-in, extended) | Security event log cleared — log tampering, run last to preserve prior evidence |

---
