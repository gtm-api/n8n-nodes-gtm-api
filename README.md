# n8n-nodes-gtm-api

n8n community nodes for [gtm-api](https://gtm-api.com), the LinkedIn API and MCP server for AI agents. Run LinkedIn outreach on accounts you own from n8n workflows: send connection requests and messages, enrich people, run searches, and trigger on replies. Every action executes on the hosted platform, where account safety is enforced: warm-up ramps for fresh accounts, server-side daily limits, health-aware pacing. gtm-api reports 20,000+ LinkedIn accounts running at under 1% monthly ban; the method is written up at [gtm-api.com/safe-linkedin-automation](https://gtm-api.com/safe-linkedin-automation/).

## Nodes

- **gtm-api**: actions on your sender accounts.
  - Connection Request: Send (note support, optional no-note fallback, resend cooldowns respected server-side)
  - Message: Send (to a member by ln_id / sn_id, or into an existing conversation)
  - Person: Enrich (lite profile: name, headline, canonical ids)
  - People Search: Search by URL (paste a people search URL, get structured rows)
- **gtm-api Trigger**: fires on webhook events.
  - Message Received, Connection Request Accepted, Invitation Received
  - Registers the webhook on activation and removes it on deactivation. The n8n instance must be reachable over public https; the platform refuses non-public target URLs.

## Install

Self-hosted n8n: Settings, Community Nodes, Install, enter `n8n-nodes-gtm-api`.

## Credentials

One field: the API key. Create it at [app.gtm-api.com](https://app.gtm-api.com) (7-day trial, no card) and connect a LinkedIn account you own.

## Links

- API docs: [docs.gtm-api.com](https://docs.gtm-api.com)
- What the platform does and the safety model: [gtm-api.com](https://gtm-api.com)
- MCP server for AI agents: [github.com/gtm-api/linkedin-mcp](https://github.com/gtm-api/linkedin-mcp)

## License

MIT
