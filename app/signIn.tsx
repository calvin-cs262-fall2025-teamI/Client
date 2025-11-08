// CLIENT/app/screens/auth/signInScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { validateEmail } from "./utils/validationUtils";
import {useAuth} from "./utils/authContext";


export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);

  // Authentication 
  const {login} = useAuth();
  

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

  const handleSignIn = async () => {
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

    setIsLoading(true);
    login({ role: "admin", userId: "temp-id" });
    setIsLoading(false);
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
          disabled={isLoading}
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
          disabled={isLoading}
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
          disabled={isLoading || !!emailError || !!passwordError}
          loading={isLoading}
        >
          Sign In
        </Button>

        <View style={styles.devButtonsContainer}>
          <Text style={styles.devLabel}>Quick Access (Testing)</Text>
          <View style={styles.devButtonsRow}>
            <Button
              mode="outlined"
              onPress={() => router.push("/screens/admin" as any)}
              style={styles.devButton}
              textColor="#388E3C"
            >
              Admin
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.push("/screens/user" as any)}
              style={styles.devButton}
              textColor="#388E3C"
            >
              User
            </Button>
          </View>
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
  toggleButton: {
    marginTop: 12,
  },
  devButtonsContainer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  devLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  devButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  devButton: {
    flex: 1,
    maxWidth: 120,
  },
});