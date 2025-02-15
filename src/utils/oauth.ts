import { Client } from '.prisma/client';
import { ResourceOwner } from '@prisma/client';
import OAuth2Server from 'oauth2-server';
import { URL } from 'url';
import prisma from '../config/prismaClient';

export const getOAuth2Client = (client: {
  clientId: string;
  redirectUri: string;
  id: number;
}): OAuth2Server.Client => {
  const clientResponse: OAuth2Server.Client = {
    id: client.clientId,
    grants: ['authorization_code'], // only supported grant type
    redirectUris: client.redirectUri,
    primaryKey: client.id
  };

  return clientResponse;
};

export const getOauth2AuthorizationCode = (code: {
  redirectUri: string;
  code: string;
  expireAt: Date;
  scope: string | null;
  client: Client;
  user: ResourceOwner;
}): OAuth2Server.AuthorizationCode => {
  const codeResponse: OAuth2Server.AuthorizationCode = {
    authorizationCode: code.code,
    expiresAt: code.expireAt,
    scope: code.scope as string,
    client: getOAuth2Client(code.client),
    user: code.user,
    redirectUri: code.redirectUri
  };
  return codeResponse;
};

export const getOauth2accessToken = (token: {
  token: OAuth2Server.Token;
  client: OAuth2Server.Client;
  user: OAuth2Server.User;
}): OAuth2Server.Token => {
  const TokenResponse: OAuth2Server.Token = {
    accessToken: token.token.accessToken,
    accessTokenExpiresAt: token.token.accessTokenExpiresAt,
    scope: token.token.scope,
    client: token.client,
    user: token.user
  };
  return TokenResponse;
};

export const buildUrl = (uri: string, searchparams: any) => {
  const myUrl = new URL(uri);
  for (const property in searchparams) {
    myUrl.searchParams.append(property, searchparams[property]);
  }
  return myUrl;
};

export const saveStateAndNonce = async (
  code: string,
  state: string,
  nonce: string
): Promise<boolean> => {
  try {
    await prisma.code.update({
      where: {
        code: code
      },
      data: {
        nonce: nonce,
        state: state
      }
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const isAuthorizedApp = async (
  clientId: number,
  userId: number
): Promise<boolean> => {
  try {
    const app = await prisma.authorisedApps.findUnique({
      where: {
        clientId_userId: {
          clientId: clientId,
          userId: userId
        }
      }
    });
    if (!app) return false;
    return true;
  } catch (error) {
    throw new Error(error);
  }
};
