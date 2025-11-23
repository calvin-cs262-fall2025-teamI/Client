// CLIENT/app/screens/auth/signInScreen.tsx
import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { validateEmail } from "../../utils/validationUtils";
import { useAuth } from "../../utils/authContext";


export default function SignInScreen() {
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
  // --- Step 1: Validate Inputs ---
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    setEmailError(emailValidation.error || "");
    setTouched((prev) => ({ ...prev, email: true }));
    Alert.alert("Validation Error", "Please enter a valid email address");
    return;
  }

  if (!password.trim()) {
    setPasswordError("Password is required");
    setTouched((prev) => ({ ...prev, password: true }));
    Alert.alert("Validation Error", "Please enter your password");
    return;
  }

  if (password.length < 6) {
    setPasswordError("Password must be at least 6 characters");
    setTouched((prev) => ({ ...prev, password: true }));
    Alert.alert("Validation Error", "Password must be at least 6 characters");
    return;
  }

  // --- Step 2: Begin Loading State ---
  setIsLoading(true);

  try {
    // --- Step 3: Send Login Request ---
    const response = await fetch(
      "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net/api/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    // --- Step 4: Handle Response Errors ---
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Login failed");
    }

    // --- Step 5: Parse Successful Response ---
    const data = await response.json();
    

    // Save user session and redirect to appropriate screen
    login({
      role: data.user.role,
      userId: data.user.id,
    });

  } catch (error: any) {
    // --- Step 6: Catch and Log Errors ---
    Alert.alert("Login Failed", error.message || "An unexpected error occurred");
  } finally {
    // --- Step 7: Always Reset Loading State ---
    setIsLoading(false);
  }
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
