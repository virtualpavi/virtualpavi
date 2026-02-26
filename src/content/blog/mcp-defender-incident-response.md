---
title: "MCP + Defender: Speeding Up Incident Response"
description: "How I use Model Context Protocol to query Defender incidents, hunt threats, and cut investigation time from hours to minutes."
pubDate: 2026-02-20
tags: ["defender", "automation", "incident-response", "mcp"]
---

I've been testing the Model Context Protocol (MCP) for the past month with Microsoft Defender, and it's changed how I handle incidents. What used to take 30 minutes of portal clicking now takes 2 minutes in my terminal.

Here's what actually works.

## What is MCP, Actually?

MCP is an open protocol that lets AI assistants talk to your security tools directly. Think of it as an adapter that connects Claude, ChatGPT, or your local LLM to live data sources—Sentinel logs, Defender alerts, GitHub repos, databases, whatever.

Instead of copying alerts into ChatGPT and losing context, MCP queries live. Your AI assistant sees current data, writes KQL on the fly, and pulls the exact details you need.

The Microsoft Security team built MCP servers for Defender and Sentinel. They're open source. [Check the repo](https://github.com/microsoft/security-copilot-mcp).

## The Problem with Current Workflows

Standard incident response in Defender looks like this:

1. Alert fires → Email notification
2. Open Defender portal in browser
3. Click through 4-5 pages to find the incident
4. Manually pivot to related alerts
5. Check device timeline
6. Query logs in Advanced Hunting
7. Copy data to notes for documentation
8. Repeat for every related entity

Multiply that by 20 incidents a week. You're spending more time navigating UIs than actually investigating.

## MCP Cuts the Noise

With MCP, I stay in my terminal (or Claude Desktop). Natural language queries hit live Defender data:

```
Me: Show me high-severity incidents from the last 24 hours

MCP: Found 3 incidents:
- Suspicious PowerShell execution on DESKTOP-5X2A
- Multiple failed login attempts from 192.168.1.45  
- Malicious file detected: invoice.exe

Me: Tell me more about the PowerShell one

MCP: [Queries Defender API]
Incident #7392
Device: DESKTOP-5X2A (John-Marketing)
Process: powershell.exe -enc <base64>
Parent: WINWORD.EXE
Time: 2026-02-20 14:23:01 UTC
```

No portal. No clicking. Just context.

## Setup (15 Minutes)

### Prerequisites

- Microsoft Defender for Endpoint (obviously)
- App registration in Entra ID with Defender API permissions
- Python 3.10+ or Node.js (for running the MCP server)
- Claude Desktop, Continue.dev, or any MCP-compatible client

### 1. Create App Registration

Head to Entra ID → App registrations → New registration.

**Required API permissions:**
```
Microsoft Threat Protection
- Incident.Read.All
- AdvancedHunting.Read.All  
- Machine.Read.All
- Alert.Read.All
```

Generate a client secret. Save it—you'll need it once.

### 2. Install the MCP Server

```bash
git clone https://github.com/microsoft/security-copilot-mcp
cd security-copilot-mcp/defender

# Install dependencies
pip install -r requirements.txt

# Configure credentials
cp .env.example .env
nano .env
```

Your `.env` file:

```bash
TENANT_ID="your-tenant-id"
CLIENT_ID="your-app-client-id"
CLIENT_SECRET="your-client-secret"
```

### 3. Connect to Claude Desktop

Edit Claude's config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac, `%APPDATA%\Claude\` on Windows):

```json
{
  "mcpServers": {
    "defender": {
      "command": "python",
      "args": ["/path/to/defender-mcp/server.py"],
      "env": {
        "TENANT_ID": "your-tenant-id",
        "CLIENT_ID": "your-app-client-id",
        "CLIENT_SECRET": "your-client-secret"
      }
    }
  }
}
```

Restart Claude. You're live.

## Real-World Use Cases

### Incident Triage

Instead of opening every alert, I filter in natural language:

```
Show me incidents with severity "high" or "critical" 
that involve lateral movement OR privilege escalation
```

MCP translates that to the Defender API, returns relevant incidents, and I focus on what matters.

### Device Investigation

When an alert fires on a device, I don't open the portal:

```
Get all alerts for device DESKTOP-5X2A in the last 7 days
```

MCP pulls:
- Active alerts
- Historical incidents  
- Running processes
- Network connections
- Recent file modifications

Everything in one query.

### Threat Hunting with KQL

The real power: KQL generation on demand.

```
Me: Find all devices that executed PowerShell with base64 encoding 
     in the last 48 hours

MCP: Running Advanced Hunting query...

DeviceProcessEvents
| where Timestamp > ago(2d)
| where ProcessCommandLine contains "powershell" 
    and ProcessCommandLine contains "-enc"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine
| order by Timestamp desc
```

MCP writes the query, executes it, and returns results. If the query fails, it debugs and retries. I've stopped Googling KQL syntax.

### Enrichment During Incidents

Mid-investigation, I need context:

```
What's the risk score for device DESKTOP-5X2A?
Has this device been compromised before?
Show me the user's recent login locations.
```

MCP pivots automatically. No tab-switching.

## Threat Hunting Workflow

Here's how I hunt with MCP now:

### 1. Hypothesis → Query

Instead of writing KQL from scratch:

```
Me: I think attackers are using WMI for persistence. 
    Show me suspicious WMI activity.

MCP: [Generates and runs query]

DeviceEvents  
| where ActionType == "WmiBindEventFilterToConsumerAction"
| where Timestamp > ago(7d)
| summarize Count=count() by DeviceName, AccountName
| where Count > 5
```

If I disagree with the logic, I refine:

```
Me: Only show me this for non-admin accounts

MCP: [Adjusts query, adds filter for AccountName !contains "admin"]
```

### 2. Pivot Automatically

Once I find something interesting:

```
Me: That device "SERVER-03" looks weird. 
    What else has it been doing?

MCP: [Queries device timeline, network connections, file access]
```

It's like having a junior analyst who never gets tired.

### 3. Document Findings

At the end, MCP summarizes:

```
Me: Summarize what we found

MCP: Investigation Summary:
- 3 devices executed WMI persistence commands
- All from user account "svc-backup" (service account)  
- Commands originated from DESKTOP-ADMIN (IT workstation)
- Timeline: 2026-02-19 18:00 - 19:30 UTC
- Likely credential compromise, not malware
```

Copy that into your ticket. Done.

## What MCP Doesn't Do

Let's be real. MCP isn't magic.

**No automated remediation.** MCP reads data. It doesn't isolate devices or kill processes. You still make those calls.

**Not a replacement for your brain.** MCP helps you move faster. It doesn't replace analysis. Bad queries return bad results.

**Rate limits exist.** Defender APIs have throttling. Spam queries = temporary lockout. Pace yourself.

**Limited to API scope.** If Defender's API doesn't expose it, MCP can't query it. Some portal features aren't available.

## Actual Time Savings

Before MCP:
- Initial triage: 10 min per incident
- Device investigation: 15 min
- Query writing/debugging: 20 min  
- Documentation: 10 min
**Total: ~55 min per incident**

After MCP:
- Initial triage: 2 min  
- Device investigation: 5 min
- Query execution: 2 min
- Documentation: 3 min
**Total: ~12 min per incident**

That's 43 minutes saved. Per incident.

Over 20 incidents a week? I'm saving 14+ hours.

## Security Considerations

MCP has direct API access to your security data. Lock it down:

1. **Least privilege:** Only grant required API permissions
2. **Rotate secrets:** Client secrets expire. Set calendar reminders.
3. **Audit queries:** Log all MCP interactions. Review them.
4. **Restrict access:** Not everyone needs MCP. Limit to IR team.
5. **Network segmentation:** Run MCP server on isolated admin workstation

Don't run the MCP server on a shared machine. Don't commit secrets to Git. Basic hygiene still applies.

## The Best Part

MCP works with multiple data sources simultaneously.

I've configured:
- Microsoft Defender (endpoint telemetry)
- Microsoft Sentinel (log analytics)  
- GitHub (IR runbook repos)
- Internal wiki (historical incidents)

One query can pull from all of them:

```
Me: Has anyone dealt with this file hash before?

MCP: [Searches Sentinel logs, Defender alerts, and IR wiki]

Found in wiki: Similar hash seen in Q3 2025 incident #4421
Analyst notes: False positive from internal dev tool
Recommendation: Whitelist
```

That's institutional knowledge at your fingertips.

## Try It

The Microsoft MCP servers are free and open source. Setup takes 15 minutes. You'll save hours by the end of the week.

GitHub: [microsoft/security-copilot-mcp](https://github.com/microsoft/security-copilot-mcp)

If you're drowning in Defender alerts, try MCP. It won't solve every problem, but it'll give you time back to solve the right ones.

---

*Using MCP in your SOC? [Hit me up](/contact). I'd love to hear what's working.*
