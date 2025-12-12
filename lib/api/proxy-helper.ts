import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Helper để proxy API requests từ client đến server
 */
export async function proxyApiRequest(url: string, body: unknown) {
  const response = await axios.post(url, body, {
    headers: { 'Content-Type': 'application/json' },
    httpsAgent,
  });
  return response;
}

/**
 * Helper để gọi API từ client hoặc server
 */
export async function callApi<T>(
  clientUrl: string,
  serverUrl: string,
  data: unknown
): Promise<T> {
  const isClient = typeof window !== 'undefined';
  const url = isClient ? clientUrl : serverUrl;
  
  const response = await axios.post<T>(url, data, {
    headers: { 'Content-Type': 'application/json' },
    ...(isClient ? {} : { httpsAgent }),
  });
  
  return response.data;
}

