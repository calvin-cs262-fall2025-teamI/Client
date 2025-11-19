// CLIENT/app/screens/auth/signInScreen.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { validateEmail } from "../../utils/validationUtils";

const API_URL = "https://parkmaster-amhpdpftb4hqcfc9.canadacentral-01.azurewebsites.net";

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateAccount, setShowCreateAccount] = useState(false);

  // Additional fields for account creation
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // Test server connectivity on mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Testing server connection to:", API_URL);
        const response = await fetch(API_URL);
        console.log("Server test response:", response.status, response.statusText);
        if (response.ok) {
          console.log("✅ Server is reachable");
        } else {
          console.warn("⚠️ Server responded but with status:", response.status);
        }
      } catch (error) {
        console.error("❌ Cannot reach server:", error);
        console.error("Make sure the server is running at:", API_URL);
      }
    };
    testConnection();
  }, []);

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

    try {
      // Check if user exists by email
      const response = await fetch(`${API_URL}/api/users/email/${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const user = await response.json();
        
        // TODO: In production, password should be verified on the server
        // For now, we'll just check if user exists and redirect based on role
        console.log("User found:", user);
        
        // Navigate based on user role
        if (user.role === "admin") {
          router.push("/screens/admin" as any);
        } else {
          router.push("/screens/user" as any);
        }
        
        Alert.alert("Success", `Welcome back, ${user.name}!`);
      } else if (response.status === 404) {
        Alert.alert(
          "Account Not Found",
          "No account found with this email. Would you like to create one?",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Create Account", 
              onPress: () => setShowCreateAccount(true)
            }
          ]
        );
      } else {
        throw new Error("Failed to sign in");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      Alert.alert(
        "Error",
        "Unable to sign in. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async () => {
    console.log("=== CREATE ACCOUNT STARTED ===");
    
    // Validate all fields
    if (!name.trim()) {
      setNameError("Name is required");
      Alert.alert("Validation Error", "Please enter your name");
      return;
    }

    if (!phone.trim()) {
      setPhoneError("Phone number is required");
      Alert.alert("Validation Error", "Please enter your phone number");
      return;
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setEmailError(emailValidation.error || "");
      Alert.alert("Validation Error", "Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      Alert.alert("Validation Error", "Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Prepare user data - make sure all required fields are present
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: "client",
        department: "General",
        status: "active",
        avatar: null
      };

      console.log("API URL:", API_URL);
      console.log("User data to send:", JSON.stringify(userData, null, 2));

      // Create new user
      console.log("Sending POST request to:", `${API_URL}/api/users`);
      
      const response = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData),
      });

      console.log("Response received:");
      console.log("- Status:", response.status);
      console.log("- Status Text:", response.statusText);
      console.log("- Headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));
      
      // Try to get response body
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("- Body:", responseText);
      } catch (textError) {
        console.error("Error reading response text:", textError);
        throw new Error("Failed to read server response");
      }

      if (response.ok) {
        console.log("Response is OK (200-299)");
        let newUser;
        try {
          newUser = JSON.parse(responseText);
          console.log("Parsed user data:", newUser);
        } catch (parseError) {
          console.error("Failed to parse response:", parseError);
          console.error("Response text was:", responseText);
          throw new Error("Server returned invalid data format");
        }
        
        console.log("User created successfully! ID:", newUser.id);
        
        Alert.alert(
          "Success",
          `Account created successfully! Welcome, ${newUser.name}!`,
          [
            {
              text: "OK",
              onPress: () => {
                console.log("Navigating to user dashboard...");
                router.push("/screens/user" as any);
              }
            }
          ]
        );
      } else {
        console.log("Response not OK, status:", response.status);
        
        // Try to parse error message
        let errorMessage = `Server error: ${response.status} ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          console.log("Parsed error data:", errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.log("Could not parse error as JSON, using raw text");
          if (responseText && responseText.length > 0) {
            errorMessage = responseText.substring(0, 200); // Limit length
          }
        }
        
        console.error("Error message:", errorMessage);
        
        // Check for specific error types
        if (response.status === 409 || 
            responseText.toLowerCase().includes("unique") || 
            responseText.toLowerCase().includes("duplicate") || 
            responseText.toLowerCase().includes("already exists")) {
          throw new Error("This email is already registered. Please sign in instead.");
        }
        
        if (response.status === 400) {
          throw new Error("Invalid data provided. Please check all fields.");
        }
        
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("=== CREATE ACCOUNT ERROR ===");
      console.error("Error type:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Full error:", error);
      
      // Check if it's a network error
      if (error.message?.includes("Network request failed") || 
          error.message?.includes("Failed to fetch")) {
        Alert.alert(
          "Connection Error",
          "Cannot connect to server. Please check:\n" +
          "1. Server is running\n" +
          "2. URL is correct: " + API_URL + "\n" +
          "3. Your internet connection"
        );
      } else {
        Alert.alert(
          "Error",
          error.message || "Unable to create account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
      console.log("=== CREATE ACCOUNT ENDED ===");
    }
  };

  const toggleCreateAccount = () => {
    setShowCreateAccount(!showCreateAccount);
    // Reset errors when toggling
    setNameError("");
    setPhoneError("");
    setEmailError("");
    setPasswordError("");
    setTouched({ email: false, password: false });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Parkmaster</Text>
          <Text style={styles.subtitle}>Parking Lot Management</Text>

          {showCreateAccount && (
            <>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setNameError("");
                }}
                style={styles.input}
                mode="outlined"
                outlineColor={nameError ? "#F44336" : "#388E3C"}
                activeOutlineColor={nameError ? "#F44336" : "#388E3C"}
                error={!!nameError}
                disabled={isLoading}
              />
              {nameError && (
                <HelperText type="error" visible={true} style={styles.errorText}>
                  {nameError}
                </HelperText>
              )}

              <TextInput
                label="Phone Number"
                value={phone}
                onChangeText={(text) => {
                  setPhone(text);
                  setPhoneError("");
                }}
                style={styles.input}
                mode="outlined"
                outlineColor={phoneError ? "#F44336" : "#388E3C"}
                activeOutlineColor={phoneError ? "#F44336" : "#388E3C"}
                keyboardType="phone-pad"
                error={!!phoneError}
                disabled={isLoading}
              />
              {phoneError && (
                <HelperText type="error" visible={true} style={styles.errorText}>
                  {phoneError}
                </HelperText>
              )}
            </>
          )}

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
            onPress={showCreateAccount ? handleCreateAccount : handleSignIn}
            style={styles.button}
            buttonColor="#388E3C"
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            disabled={isLoading || !!emailError || !!passwordError}
            loading={isLoading}
          >
            {showCreateAccount ? "Create Account" : "Sign In"}
          </Button>

          <Button
            mode="text"
            onPress={toggleCreateAccount}
            style={styles.toggleButton}
            textColor="#388E3C"
            disabled={isLoading}
          >
            {showCreateAccount
              ? "Already have an account? Sign In"
              : "Don't have an account? Create One"}
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    minHeight: 600, // Ensures content doesn't get cut off
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
    marginBottom: 32,
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
    marginBottom: 8,
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