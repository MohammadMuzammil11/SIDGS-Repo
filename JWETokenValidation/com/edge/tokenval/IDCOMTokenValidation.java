package com.edge.tokenval;

import com.apigee.flow.execution.ExecutionContext;
import com.apigee.flow.execution.ExecutionResult;
import com.apigee.flow.execution.spi.Execution;
import com.apigee.flow.message.MessageContext;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.jose4j.jwa.AlgorithmConstraints;
import org.jose4j.jwa.AlgorithmConstraints.ConstraintType;
import org.jose4j.jwe.JsonWebEncryption;
import org.jose4j.jwt.consumer.InvalidJwtException;
import org.jose4j.jwt.consumer.JwtContext;
import org.jose4j.jwt.consumer.ErrorCodeValidator.Error;
import org.jose4j.lang.JoseException;

public class IDCOMTokenValidation implements Execution {
   private static final String PRIVATE_KEY = "private.IdTokenPrivateKey";
   private static final String IDCOM_TOKEN = "IDCOM_Token";
   private static final Logger LOGGER = Logger.getLogger(TokenValidation.class.getName());

   public ExecutionResult execute(MessageContext messageContext, ExecutionContext executionContext) {
      try {
         String privatekey = (String)messageContext.getVariable("private.IdTokenPrivateKey");
         String token = (String)messageContext.getVariable("IDCOM_Token");
         PrivateKey privateKey = TokenValidation.getPrivateKey(privatekey);
         String jwtString = TokenValidation.testDecryptWithJose4J(token, privateKey);
         messageContext.setVariable("jwt_IDCOM", jwtString);
         return ExecutionResult.SUCCESS;
      } catch (Exception var7) {
         messageContext.setVariable("TokenGenerationStatus", "IDCOMTokenValidationFail");
         messageContext.setVariable("errormessage", var7);
         return ExecutionResult.ABORT;
      }
   }

   public static String testDecryptWithJose4J(String jwe, PrivateKey privatekey) throws JoseException, InvalidJwtException {
      JsonWebEncryption receiverJwe = new JsonWebEncryption();
      AlgorithmConstraints algConstraints = new AlgorithmConstraints(ConstraintType.PERMIT, new String[]{"RSA-OAEP"});
      receiverJwe.setAlgorithmConstraints(algConstraints);
      AlgorithmConstraints encConstraints = new AlgorithmConstraints(ConstraintType.PERMIT, new String[]{"A128CBC-HS256"});
      receiverJwe.setContentEncryptionAlgorithmConstraints(encConstraints);
      receiverJwe.setKey(privatekey);
      receiverJwe.setCompactSerialization(jwe);
      String payload = receiverJwe.getPayload();
      if ("JWT".equals(receiverJwe.getHeader("cty")) && "JWT".equals(receiverJwe.getHeader("typ"))) {
         return payload;
      } else {
         throw new InvalidJwtException("'cty' or 'typ' header is missing", (Error)null, (Throwable)null, (JwtContext)null);
      }
   }

   public static PrivateKey getPrivateKey(String base64PrivateKey) {
      PrivateKey privateKey = null;
      PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(Base64.getDecoder().decode(base64PrivateKey.getBytes()));
      KeyFactory keyFactory = null;

      try {
         keyFactory = KeyFactory.getInstance("RSA");
      } catch (NoSuchAlgorithmException var6) {
         LOGGER.log(Level.INFO, "Exception occur 1", var6);
      }

      try {
         privateKey = keyFactory.generatePrivate(keySpec);
      } catch (InvalidKeySpecException var5) {
         LOGGER.log(Level.INFO, "Exception occur 1", var5);
      }

      return privateKey;
   }
}
