export default {
    oidc: {
        // You get the clientId, issuer, redirectUri from the Okta application page. -- (Technically, you will setup the redirectUri)
        clientId: '0oam98ezll1JE3pju5d7',
        // issuer is the token issuer. It is the URL when authorizing with the Okta authorization server.
        issuer: 'https://dev-30791281.okta.com/oauth2/default',
        // Once logged in successfully, send them to the redirectUri
        redirectUri: 'https://localhost:4200/login/callback',
        // scopes provide the access info. about the user.
        scopes: ['openid', 'profile', 'email']
    }
}


