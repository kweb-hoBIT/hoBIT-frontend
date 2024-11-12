import JSONbig from 'json-bigint';
import { envs } from '../envs';
import {
	ApiResponse,
	fetchErrorPayload,
	HobitApiRequest,
	HobitApiResponse,
	jsonParseFailPayload,
} from '../types/api';

const endpoint = `${envs.HOBIT_BACKEND_ENDPOINT!}/api/v0`;

export async function hobitApi<
	T extends HobitApiRequest,
	R extends { type: T['type'] } & HobitApiResponse,
>(req: T): Promise<ApiResponse<R>> {
	const headers: Record<string, string> = {
		'Content-type': 'application/json',
	};

	const path = req.type;

	let resp;
	try {
		resp = await fetch(`${endpoint}/${path}`, {
			method: 'POST',
			mode: 'cors',
			headers,
			body: JSONbig.stringify(req),
		});
	} catch (err) {
		return {
			error: fetchErrorPayload,
			payload: null,
		};
	}

	try {
		const json = await resp.json();
		return json;
	} catch (err) {
		return { error: jsonParseFailPayload, payload: null };
	}
}
