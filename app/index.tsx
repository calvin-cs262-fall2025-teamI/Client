"use client"

import { useRouter } from "expo-router"
import { StyleSheet, Text, View } from "react-native"
import { Button } from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"

export default function HomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Parkmaster</Text>
        <Text style={styles.subtitle}>Manage and schedule parking with ease</Text>

        <Button
          mode="contained"
          onPress={() => router.push("/signin")}
          style={styles.button}
          buttonColor="#388E3C"
          labelStyle={{ fontSize: 16, fontWeight: "600" }}
        >
          Get Started
        </Button>

        <Button
          mode="outlined"
          onPress={() => router.push("/create-lot")}
          style={[styles.button, { marginTop: 12 }]}
          labelStyle={{ color: "#388E3C", fontSize: 16, fontWeight: "600" }}
        >
          Create Parking Lot
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: "700",
    color: "#388E3C",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: 250,
    borderRadius: 10,
    paddingVertical: 4,
  },
})
