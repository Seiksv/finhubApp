import React from "react";
import { Button, View } from "react-native";
import * as Google from "expo-auth-session/providers/google";
import { signInWithCredential, GoogleAuthProvider } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig, auth } from "../utils/expoconfig";

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

function Settings() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "7603217639-n45ddhiqjv2iud8n1qlb9cn9qab171ff.apps.googleusercontent.com",
  });

  const handleGoogleLogin = async () => {
    try {
      const result = await promptAsync();
      if (result.type === "success") {
        if (request.id_token) {
          const credential = GoogleAuthProvider.credential(request.id_token);
          await signInWithCredential(auth, credential);
        } else {
          console.log("No id_token found");
        }
      } else {
        console.log("Authentication with Google was not successful");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <Button title="Login with Google" onPress={handleGoogleLogin} />
    </View>
  );
}

export default Settings;
