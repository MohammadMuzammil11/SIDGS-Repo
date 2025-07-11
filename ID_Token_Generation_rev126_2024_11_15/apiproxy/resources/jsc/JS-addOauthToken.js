var requestPayload= context.getVariable('requestPayload'); 

var oauthToken = context.getVariable('oauthv2accesstoken.OAuthGenerateToken.access_token');

var tokenClaims = requestPayload.reqTokenClaims;

tokenClaims["oauth-token"] = oauthToken;

context.setVariable("reqTokenClaims",JSON.stringify(tokenClaims)); 

print("tokenClaims"+JSON.stringify(tokenClaims));







