import type {
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

const ORCH_BASE = 'https://app.gtm-api.com/orchestration/v4';

// One subscription per workflow: n8n hands us a unique target URL, we register
// it for exactly one event via POST /api/webhooks and delete it by sid on
// deactivation. The create response carries the row in `item`.
export class GtmApiTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'gtm-api Trigger',
		name: 'gtmApiTrigger',
		icon: 'file:gtmapi.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description:
			'Fires on gtm-api webhook events: a reply lands, a connection request is accepted, an invitation comes in',
		defaults: { name: 'gtm-api Trigger' },
		inputs: [],
		outputs: ['main'],
		credentials: [{ name: 'gtmApiApi', required: true }],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				options: [
					{
						name: 'Message Received',
						value: 'linkedin-messages.received',
						description: 'One of your senders received a LinkedIn message',
					},
					{
						name: 'Connection Request Accepted',
						value: 'linkedin-connection-requests.accepted',
						description: 'A connection request sent from one of your senders was accepted',
					},
					{
						name: 'Invitation Received',
						value: 'linkedin-connection-invitations.received',
						description: 'One of your senders received an incoming connection invitation',
					},
				],
				default: 'linkedin-messages.received',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				const sid = data.webhookSid as string | undefined;
				if (!sid) return false;
				try {
					await this.helpers.httpRequestWithAuthentication.call(this, 'gtmApiApi', {
						method: 'GET',
						url: `${ORCH_BASE}/api/webhooks/${sid}`,
						json: true,
					});
					return true;
				} catch {
					delete data.webhookSid;
					return false;
				}
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;
				const response = (await this.helpers.httpRequestWithAuthentication.call(
					this,
					'gtmApiApi',
					{
						method: 'POST',
						url: `${ORCH_BASE}/api/webhooks`,
						body: { name: `n8n: ${event}`, target_url: webhookUrl, events: [event] },
						json: true,
					},
				)) as { item?: { sid?: string } };
				const sid = response?.item?.sid;
				if (!sid) return false;
				this.getWorkflowStaticData('node').webhookSid = sid;
				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const data = this.getWorkflowStaticData('node');
				const sid = data.webhookSid as string | undefined;
				if (sid) {
					try {
						await this.helpers.httpRequestWithAuthentication.call(this, 'gtmApiApi', {
							method: 'DELETE',
							url: `${ORCH_BASE}/api/webhooks/${sid}`,
							json: true,
						});
					} catch {
						// Already gone server-side; nothing to clean up.
					}
					delete data.webhookSid;
				}
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		return {
			workflowData: [this.helpers.returnJsonArray(this.getBodyData())],
		};
	}
}
