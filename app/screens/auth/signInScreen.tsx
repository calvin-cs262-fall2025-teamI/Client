// CLIENT/app/screens/auth/signInScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Text, TextInput, HelperText } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { validateEmail } from "../../utils/validationUtils";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleEmailBlur = () => {
    setTouched({ ...touched, email: true });
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setEmailError(validation.error || "");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = () => {
    setTouched({ ...touched, password: true });
    if (!password.trim()) {
      setPasswordError("Password is required");
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (touched.email) {
      const validation = validateEmail(text);
      if (!validation.isValid) {
        setEmailError(validation.error || "");
      } else {
        setEmailError("");
      }
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (touched.password) {
      if (!text.trim()) {
        setPasswordError("Password is required");
      } else if (text.length < 6) {
        setPasswordError("Password must be at least 6 characters");
      } else {
        setPasswordError("");
      }
    }
  };

  const handleSignIn = () => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "");
      setTouched({ ...touched, email: true });
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      setTouched({ ...touched, password: true });
      Alert.alert("Validation Error", "Please enter your password");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      setTouched({ ...touched, password: true });
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    // If validation passes, proceed with sign in
    // TODO: Add actual authentication logic here
    Alert.alert("Success", "Sign in successful!");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Parkmaster</Text>
        <Text style={styles.subtitle}>Parking Lot Management</Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={handleEmailChange}
          onBlur={handleEmailBlur}
          style={styles.input}
          mode="outlined"
          outlineColor={touched.email && emailError ? "#F44336" : "#388E3C"}
          activeOutlineColor={touched.email && emailError ? "#F44336" : "#388E3C"}
          keyboardType="email-address"
          autoCapitalize="none"
          error={touched.email && !!emailError}
        />
        {touched.email && emailError && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {emailError}
          </HelperText>
        )}

        <TextInput
          label="Password"
          value={password}
          onChangeText={handlePasswordChange}
          onBlur={handlePasswordBlur}
          style={styles.input}
          mode="outlined"
          outlineColor={touched.password && passwordError ? "#F44336" : "#388E3C"}
          activeOutlineColor={touched.password && passwordError ? "#F44336" : "#388E3C"}
          secureTextEntry
          error={touched.password && !!passwordError}
        />
        {touched.password && passwordError && (
          <HelperText type="error" visible={true} style={styles.errorText}>
            {passwordError}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          buttonColor="#388E3C"
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
          disabled={!!emailError || !!passwordError}
        >
          Sign In
        </Button>

        <View style={styles.devButtonsContainer}>
          <Button
            mode="contained"
            onPress={() => router.push("/screens/admin" as any)}
            style={styles.devButton}
          >
            Admin
          </Button>
          <Button
            mode="contained"
            onPress={() => router.push("/screens/user" as any)}
            style={styles.devButton}
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
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  errorText: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  devButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginTop: 40,
  },
  devButton: {
    alignSelf: "center",
    marginBottom: 20,
  },
});