var requestPayload = JSON.parse(context.getVariable('request.content'));

var validFor = requestPayload.reqHeader.tokenType;

var expiry = requestPayload.reqHeader.validFor;

context.setVariable("expiry",expiry);

if(validFor === 'M'){
    context.setVariable("requestPayload",requestPayload);
context.setVariable("reqTokenClaims",JSON.stringify(requestPayload.reqTokenClaims));    
context.setVariable("isValidScope", false);
}
else if(validFor === 'S'){
context.setVariable("requestPayload",requestPayload);    
context.setVariable("clientId",requestPayload.reqHeader['client-id']);
context.setVariable("clientSecret",requestPayload.reqHeader['client-secret']);
context.setVariable("isValidScope", true);    
}
else{
     context.setVariable("isValid", false);
        throw 'S & M values are empty';
}


