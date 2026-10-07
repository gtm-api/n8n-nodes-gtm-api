# n8n-nodes-gtm-api

n8n community nodes for [gtm-api.com](https://gtm-api.com), the LinkedIn API and MCP server for AI agents. Run LinkedIn outreach on accounts you own from n8n workflows: send connection requests and messages, enrich people, run searches, and trigger on replies. Every action executes on the hosted platform, where account safety is enforced: warm-up ramps for fresh accounts, server-side daily limits, health-aware pacing. 20,000+ LinkedIn accounts run on that stack, and under 1% of them have ever been restricted. The method is written up at [gtm-api.com/safe-linkedin-automation](https://gtm-api.com/safe-linkedin-automation/).

## Nodes

- **gtm-api**: actions on your sender accounts.
  - Connection Request: Send (note support, optional no-note fallback, resend cooldowns respected server-side)
  - Message: Send (to a member by ln_id / sn_id, or into an existing conversation)
  - Person: Enrich (lite profile: full name, profile slug, LinkedIn IDs, connection degree)
  - People Search: Search by URL (paste a people search URL, get structured rows)
- **gtm-api Trigger**: fires on webhook events.
  - Message Received, Connection Request Accepted, Invitation Received
  - Registers the webhook on activation and removes it on deactivation. The n8n instance must be reachable over public https, because the platform refuses non-public target URLs.

## Install

It is a verified community node: search for gtm-api in the nodes panel and install it from there, on
n8n Cloud and self-hosted alike. A self-hosted instance can also install it by name: Settings,
Community Nodes, Install, enter `n8n-nodes-gtm-api`.

## Credentials

One field: the API key. Create it at [app.gtm-api.com](https://app.gtm-api.com) (forever free plan, no card) and connect a LinkedIn account you own.

## Example workflow

Search a people-search URL, then invite every row from one sender. Paste into a
blank canvas (Ctrl+V), then pick your credential and pick the sender in the
**Sender** dropdown on the invite node.

```json
{
  "nodes": [
    {
      "parameters": {
        "resource": "peopleSearch",
        "operation": "searchByUrl",
        "url": "https://www.linkedin.com/search/results/people/?keywords=head%20of%20growth"
      },
      "type": "n8n-nodes-gtm-api.gtmApi",
      "typeVersion": 1,
      "position": [0, 0],
      "name": "Search people"
    },
    {
      "parameters": {
        "resource": "connectionRequest",
        "operation": "send",
        "profileId": "={{ $json.ln_id }}",
        "note": "=Hi {{ $json.full_name.split(' ')[0] }}, saw your work on outbound. Worth a chat?",
        "allowNoNoteFallback": true
      },
      "type": "n8n-nodes-gtm-api.gtmApi",
      "typeVersion": 1,
      "position": [240, 0],
      "name": "Send invite"
    }
  ],
  "connections": {
    "Search people": { "main": [[{ "node": "Send invite", "type": "main", "index": 0 }]] }
  }
}
```

No wait node is needed between the two. Pacing against that account's own daily
budget, the warm-up ramp and the resend cooldown are enforced on the platform,
not in the workflow.

For the trigger, add a **gtm-api Trigger** node, pick an event, and activate the
workflow: it registers the webhook on activation and removes it on deactivation.
Each execution receives the delivery envelope as its item, so `{{ $json.type }}`
is the event name and the event body is under `{{ $json.payload }}`. The n8n
instance has to be reachable over public https. The platform refuses a
non-public target URL.

## Links

- API docs: [docs.gtm-api.com](https://docs.gtm-api.com)
- What the platform does and the safety model: [gtm-api.com](https://gtm-api.com)
- MCP server for AI agents: [github.com/gtm-api/linkedin-mcp](https://github.com/gtm-api/linkedin-mcp)

## License

MIT
