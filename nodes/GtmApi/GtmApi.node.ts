import type {
	ILoadOptionsFunctions,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

// Search/list responses arrive as { success, operation, items: [{ item }] };
// action responses as { success, operation, action, item, result }.
export class GtmApi implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'gtm-api',
		name: 'gtmApi',
		icon: { light: 'file:gtmapi.svg', dark: 'file:gtmapi.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			'LinkedIn outreach on accounts you own: send connection requests and messages, enrich people, run searches. Safety is enforced server-side.',
		defaults: { name: 'gtm-api' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: 'gtmApiApi', required: true }],
		requestDefaults: {
			baseURL: 'https://app.gtm-api.com/linkedin/v4',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Connection Request', value: 'connectionRequest' },
					{ name: 'Message', value: 'message' },
					{ name: 'Person', value: 'person' },
					{ name: 'People Search', value: 'peopleSearch' },
				],
				default: 'connectionRequest',
			},

			// ----- connectionRequest -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['connectionRequest'] } },
				options: [
					{
						name: 'Send',
						value: 'send',
						action: 'Send a connection request',
						description:
							'Send a connection request from one of your senders, inside its safety limits',
						routing: {
							request: { method: 'POST', url: '/api/linkedin-connection-requests/send' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'item' } }] },
						},
					},
				],
				default: 'send',
			},

			// ----- message -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['message'] } },
				options: [
					{
						name: 'Send',
						value: 'send',
						action: 'Send a message',
						description: 'Send a direct message to a conversation or a member',
						routing: {
							request: { method: 'POST', url: '/api/linkedin-messages/send' },
							output: { postReceive: [{ type: 'rootProperty', properties: { property: 'item' } }] },
						},
					},
				],
				default: 'send',
			},

			// ----- person -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['person'] } },
				options: [
					{
						name: 'Enrich',
						value: 'enrich',
						action: 'Enrich a person profile',
						description: 'Fetch the lite profile: full name, profile slug, LinkedIn IDs and connection degree',
						routing: {
							request: { method: 'POST', url: '/api/linkedin-enrichment/person-lite-profile' },
							output: {
								postReceive: [{ type: 'rootProperty', properties: { property: 'result' } }],
							},
						},
					},
				],
				default: 'enrich',
			},

			// ----- peopleSearch -----
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['peopleSearch'] } },
				options: [
					{
						name: 'Search by URL',
						value: 'searchByUrl',
						action: 'Search people by URL',
						description: 'Run a people search from a pasted search URL and return one item per row',
						routing: {
							request: { method: 'POST', url: '/api/linkedin-scraping/search-people' },
							output: {
								// result.rows holds the page; one n8n item per person so the next node runs per row
								postReceive: [
									{ type: 'rootProperty', properties: { property: 'result' } },
									{ type: 'rootProperty', properties: { property: 'rows' } },
								],
							},
						},
					},
				],
				default: 'searchByUrl',
			},

			// ----- shared: sender -----
			{
				displayName: 'Sender Name or ID',
				name: 'linkedinAccountSid',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getSenders' },
				required: true,
				displayOptions: { show: { resource: ['connectionRequest', 'message'] } },
				default: '',
				description:
					'The sender account the action goes out from. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'body', property: 'linkedin_account_sid' } },
			},
			{
				displayName: 'Sender Name or ID',
				name: 'linkedinAccountSid',
				type: 'options',
				typeOptions: { loadOptionsMethod: 'getSenders' },
				displayOptions: { show: { resource: ['person', 'peopleSearch'] } },
				default: '',
				description:
					'Optional: run the lookup through a specific sender account. Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
				routing: { send: { type: 'body', property: 'linkedin_account_sid' } },
			},

			// ----- connectionRequest fields -----
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['connectionRequest'], operation: ['send'] } },
				default: '',
				description: 'The target member ID (ln_id or sn_id) from gtm-api search or enrichment',
				routing: { send: { type: 'body', property: 'profile_id' } },
			},
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				typeOptions: { rows: 3 },
				displayOptions: { show: { resource: ['connectionRequest'], operation: ['send'] } },
				default: '',
				description: 'Optional invite note, up to 300 characters (200 on non premium senders)',
				routing: { send: { type: 'body', property: 'note' } },
			},
			{
				displayName: 'Send Without Note if Needed',
				name: 'allowNoNoteFallback',
				type: 'boolean',
				displayOptions: { show: { resource: ['connectionRequest'], operation: ['send'] } },
				default: false,
				description:
					'Whether to retry without the note instead of failing when the note cannot be attached',
				routing: { send: { type: 'body', property: 'allow_no_note_fallback' } },
			},

			// ----- message fields -----
			{
				displayName: 'Message Text',
				name: 'text',
				type: 'string',
				typeOptions: { rows: 4 },
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['send'] } },
				default: '',
				description: 'Up to 8,000 characters',
				routing: { send: { type: 'body', property: 'text' } },
			},
			{
				displayName: 'Target',
				name: 'target',
				type: 'options',
				displayOptions: { show: { resource: ['message'], operation: ['send'] } },
				options: [
					{ name: 'Member ID', value: 'lnId' },
					{ name: 'Sales Navigator ID', value: 'snId' },
					{ name: 'Existing Conversation', value: 'conversation' },
				],
				default: 'lnId',
				description: 'Where the message goes: a member (new or existing thread) or an existing conversation',
			},
			{
				displayName: 'Member ID',
				name: 'lnId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['send'], target: ['lnId'] } },
				default: '',
				description: 'The ln_id of the member, from gtm-api search or enrichment',
				routing: { send: { type: 'body', property: 'ln_id' } },
			},
			{
				displayName: 'Sales Navigator ID',
				name: 'snId',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['message'], operation: ['send'], target: ['snId'] } },
				default: '',
				routing: { send: { type: 'body', property: 'sn_id' } },
			},
			{
				displayName: 'Conversation SID',
				name: 'conversationSid',
				type: 'string',
				required: true,
				displayOptions: {
					show: { resource: ['message'], operation: ['send'], target: ['conversation'] },
				},
				default: '',
				routing: { send: { type: 'body', property: 'linkedin_conversation_sid' } },
			},

			// ----- person fields -----
			{
				displayName: 'Public Identifier',
				name: 'publicIdentifier',
				type: 'string',
				displayOptions: { show: { resource: ['person'], operation: ['enrich'] } },
				default: '',
				description:
					'The public profile slug, the last part of a profile URL. Provide this or a Profile ID.',
				routing: { send: { type: 'body', property: 'public_identifier' } },
			},
			{
				displayName: 'Profile ID',
				name: 'profileId',
				type: 'string',
				displayOptions: { show: { resource: ['person'], operation: ['enrich'] } },
				default: '',
				description: 'The member ID (ln_id or sn_id) if you already have it',
				routing: { send: { type: 'body', property: 'profile_id' } },
			},

			// ----- peopleSearch fields -----
			{
				displayName: 'Search URL',
				name: 'url',
				type: 'string',
				required: true,
				displayOptions: { show: { resource: ['peopleSearch'], operation: ['searchByUrl'] } },
				default: '',
				description: 'Paste a people search URL; filters are taken from it verbatim',
				routing: { send: { type: 'body', property: 'url' } },
			},
			{
				displayName: 'Page',
				name: 'page',
				type: 'number',
				displayOptions: { show: { resource: ['peopleSearch'], operation: ['searchByUrl'] } },
				default: 1,
				description: 'Result page to fetch, starting at 1',
				routing: { send: { type: 'body', property: 'page' } },
			},
		],
	};

	methods = {
		loadOptions: {
			async getSenders(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const response = (await this.helpers.httpRequestWithAuthentication.call(this, 'gtmApiApi', {
					method: 'POST',
					url: 'https://app.gtm-api.com/linkedin/v4/api/linkedin-accounts/search',
					body: { page_size: 100 },
					json: true,
				})) as { items?: Array<{ item?: Record<string, unknown> }> };
				const rows = Array.isArray(response?.items)
					? response.items.map((w) => (w && w.item ? w.item : (w as Record<string, unknown>)))
					: [];
				// LinkedIn's own facts only, best first. The account's `label` is the owning
				// workspace's private operator tag and is never shown to a borrowing team.
				return rows.map((a) => ({
					name: String(a.full_name || a.nickname || a.sid),
					value: String(a.sid),
				}));
			},
		},
	};
}
