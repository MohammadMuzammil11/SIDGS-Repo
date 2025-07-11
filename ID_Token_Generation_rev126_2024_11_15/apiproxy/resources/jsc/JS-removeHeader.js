var token = context.getVariable("jwtString");
var removedHeaderToken = token.substring(token.indexOf(".") + 1);
context.setVariable("removedHeaderToken",removedHeaderToken); 