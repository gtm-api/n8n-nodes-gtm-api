import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class GtmApiApi implements ICredentialType {
	name = 'gtmApiApi';

	// One tile that reads on both themes, so both variants point at it.
	icon: Icon = { light: 'file:gtmapi.svg', dark: 'file:gtmapi.svg' };

	displayName = 'gtm-api API';

	documentationUrl = 'https://docs.gtm-api.com';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'Create an API key in the gtm-api dashboard at <a href="https://app.gtm-api.com">app.gtm-api.com</a>',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	// Cheapest authenticated call: a one row search on the senders list.
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.gtm-api.com/linkedin/v4',
			url: '/api/linkedin-accounts/search',
			method: 'POST',
			body: { page_size: 1 },
		},
	};
}
