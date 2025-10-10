import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = () => {
    // For now, just navigate to the dashboard
    // router.push("/dashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Parkmaster</Text>
        <Text style={styles.subtitle}>Parking Lot Management</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          mode="outlined"
          outlineColor="#388E3C"
          activeOutlineColor="#388E3C"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          mode="outlined"
          outlineColor="#388E3C"
          activeOutlineColor="#388E3C"
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          buttonColor="#388E3C"
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          Sign In
        </Button>

   <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" , gap: 20, marginTop: 40}}>
       <Button
        mode="contained"
        onPress={() => router.push("/screens/admin" as any)}
        style={{ alignSelf: "center", marginBottom: 20 }}
      >
        Admin
      </Button>
            <Button
        mode="contained"
        onPress={() => router.push("/screens/user" as any)}
        style={{ alignSelf: "center", marginBottom: 20 }}
      >
        User
      </Button>

   </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#388E3C",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 48,
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
});