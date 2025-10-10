"use client"

import { useRouter } from "expo-router"
import { useState } from "react"
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native"
import { Button, HelperText, Text, TextInput } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function SignUpScreen() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Password validation
  const hasMinLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  const allRequirementsMet = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  // Password strength
  const getPasswordStrength = () => {
    let strength = 0
    if (hasMinLength) strength++
    if (hasUpperCase) strength++
    if (hasLowerCase) strength++
    if (hasNumber) strength++
    if (hasSpecialChar) strength++

    if (strength <= 2) return { label: "Weak", color: "#F44336" }
    if (strength === 3) return { label: "Fair", color: "#FF9800" }
    if (strength === 4) return { label: "Good", color: "#FBC02D" }
    return { label: "Strong", color: "#388E3C" }
  }

  const strength = getPasswordStrength()

  const handleSignUp = () => {
    if (!fullName.trim()) {
      alert("Please enter your full name")
      return
    }
    if (!email.trim()) {
      alert("Please enter your email")
      return
    }
    if (!allRequirementsMet) {
      alert("Please meet all password requirements")
      return
    }
    if (!passwordsMatch) {
      alert("Passwords do not match")
      return
    }

    // Navigate to dashboard after successful signup
    router.push("/dashboard")
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Parkmaster</Text>
          <Text style={styles.subtitle}>Create Your Account</Text>

          <TextInput
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
            outlineColor="#388E3C"
            activeOutlineColor="#388E3C"
            autoCapitalize="words"
          />

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
            secureTextEntry={!showPassword}
            right={
              <TextInput.Icon icon={showPassword ? "eye-off" : "eye"} onPress={() => setShowPassword(!showPassword)} />
            }
          />

          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <Text style={styles.strengthLabel}>Password Strength: </Text>
              <Text style={[styles.strengthValue, { color: strength.color }]}>{strength.label}</Text>
            </View>
          )}

          <View style={styles.requirementsBox}>
            <Text style={styles.requirementsTitle}>Password Requirements:</Text>
            <RequirementItem met={hasMinLength} text="At least 8 characters" />
            <RequirementItem met={hasUpperCase} text="One uppercase letter" />
            <RequirementItem met={hasLowerCase} text="One lowercase letter" />
            <RequirementItem met={hasNumber} text="One number" />
            <RequirementItem met={hasSpecialChar} text="One special character" />
          </View>

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
            mode="outlined"
            outlineColor="#388E3C"
            activeOutlineColor="#388E3C"
            secureTextEntry={!showConfirmPassword}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? "eye-off" : "eye"}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          {confirmPassword.length > 0 && (
            <HelperText type={passwordsMatch ? "info" : "error"} visible={true}>
              {passwordsMatch ? "Passwords match ✓" : "Passwords do not match"}
            </HelperText>
          )}

          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.button}
            buttonColor="#388E3C"
            labelStyle={{ fontSize: 16, fontWeight: "600" }}
            disabled={!allRequirementsMet || !passwordsMatch || !fullName.trim() || !email.trim()}
          >
            Sign Up
          </Button>

          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.signinLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <View style={styles.requirementItem}>
      <Text style={[styles.requirementIcon, { color: met ? "#388E3C" : "#999" }]}>{met ? "✓" : "○"}</Text>
      <Text style={[styles.requirementText, { color: met ? "#388E3C" : "#666" }]}>{text}</Text>
    </View>
  )
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
    paddingVertical: 40,
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
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  strengthLabel: {
    fontSize: 14,
    color: "#666",
  },
  strengthValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  requirementsBox: {
    backgroundColor: "#E8F5E9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#388E3C",
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 8,
    fontWeight: "600",
  },
  requirementText: {
    fontSize: 13,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 10,
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signinText: {
    fontSize: 14,
    color: "#666",
  },
  signinLink: {
    fontSize: 14,
    color: "#388E3C",
    fontWeight: "600",
  },
})
