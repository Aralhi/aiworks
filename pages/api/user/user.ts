import { NowRequest, NowResponse } from '@vercel/node';
import { MongoClient } from 'mongodb'
const CONNECTION_STRING = "mongodb+srv://admin:xXej5RMnKceg2INK@aiworks.cuderh4.mongodb.net/test";

const handler = async (req: Request): Promise<Response> => {
  const client = await MongoClient.connect(CONNECTION_STRING, { monitorCommands: true });
  client.on('commandStarted', (event) => console.debug(event));
  client.on('commandSucceeded', (event) => console.debug(event));
  client.on('commandFailed', (event) => console.debug(event));
  return new Response('');
}

export default handler