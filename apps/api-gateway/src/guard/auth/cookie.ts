import { FastifyReply } from 'fastify';
import * as dotenv from 'dotenv';
import { GeneratedToken } from '@app/constracts';

dotenv.config();

// const isLocal = process.env.NODE_ENV === 'local';
const isLocal = true; // For test purpose, set to true always
// const COOKIE_ACCEPT_DOMAIN = process.env.COOKIE_ACCEPT_DOMAIN!;

export const setCookieForFastifyResp = (res: FastifyReply, generatedToken: GeneratedToken) => {
  // res.setCookie('access_token', generatedToken.access_token, {
  //   httpOnly: true,
  //   secure: isProd ? true : false, // true if use HTTPS
  //   maxAge: isProd ? 24 * 60 * 60 * 1000 : 60 * 1000, // 1 day : 1 minute
  //   sameSite: isProd ? 'strict' : 'none',
  //   path: '/',
  // });

  // // Set cookie refreshToken
  // res.setCookie('refresh_token', generatedToken.refresh_token, {
  //   httpOnly: true,
  //   secure: isProd ? true : false,
  //   maxAge: isProd ? 7 * 24 * 60 * 60 * 1000 : 10 * 60 * 1000, // 7 days : 10 minutes
  //   sameSite: isProd ? 'strict' : 'none',
  //   path: '/',
  // });

  res.setCookie('access_token', generatedToken.access_token, {
    httpOnly: true,
    secure: isLocal ? false : true, // true if use HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 day : 1 minute
    sameSite: 'lax',
    path: '/',
    // domain: isLocal ? undefined : COOKIE_ACCEPT_DOMAIN,
  });

  // Set cookie refreshToken
  res.setCookie('refresh_token', generatedToken.refresh_token, {
    httpOnly: true,
    secure: isLocal ? false : true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days : 10 minutes
    sameSite: 'lax',
    path: '/',
    // domain: isLocal ? undefined : COOKIE_ACCEPT_DOMAIN,
  });
};

export const clearCookieForFastifyResp = (res: FastifyReply) => {
  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isLocal ? false : true,
    sameSite: 'lax',
    path: '/',
    // domain: isLocal ? undefined : COOKIE_ACCEPT_DOMAIN,
  });
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isLocal ? false : true,
    sameSite: 'lax',
    path: '/',
    // domain: isLocal ? undefined : COOKIE_ACCEPT_DOMAIN,
  });
};
