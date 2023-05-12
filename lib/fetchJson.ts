import { API_TIMEOUT } from "@/utils/constants";

export interface CustomResponseType {
  status: string;
  message: string;
}

export default async function fetchJson<CustomResponseType>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<CustomResponseType> {
  if (init && !init.headers) {
    init.headers = {
      'Content-Type': 'application/json'
    }
  }
  const response = await fetch(input, Object.assign({ timeout: API_TIMEOUT }, init));

  // if the server replies, there's always some data in json
  // if there's a network error, it will throw at the previous line
  const data = await response.json();

  // response.ok is true when res.status is 2xx
  if (response.ok) {
    return data;
  }

  throw new FetchError({
    message: response.statusText,
    response,
    data,
  });
}

export class FetchError extends Error {
  response: Response;
  data: {
    message: string;
  };
  constructor({
    message,
    response,
    data,
  }: {
    message: string;
    response: Response;
    data: {
      message: string;
    };
  }) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(message);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FetchError);
    }

    this.name = "FetchError";
    this.response = response;
    this.data = data ?? { message: message };
  }
}
