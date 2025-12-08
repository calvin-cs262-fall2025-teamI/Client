// app/(protected)/admin/(tabs)/help.tsx
import { useRouter } from "expo-router";
import { Book, ChevronRight } from "lucide-react-native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Appbar } from "react-native-paper";

interface HelpSection {
  id: string;
  title: string;
  steps: string[];
}

export default function AdminHelpScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: "add-lot",
      title: "1.1 Add a Parking Lot",
      steps: [
        "Go to the Admin Dashboard.",
        "Select Create New Parking Lot.",
        "Enter Lot Name, Size, and Merged Rows (must be adjacent; i.e. 1 and 2).",
        "Tap on a parking lot space to bring up the space type selector screen.",
        "Click Save Changes.",
      ],
    },
    {
      id: "edit-lot",
      title: "1.2 Edit or Remove a Parking Lot",
      steps: [
        "Go to the Admin Dashboard.",
        "Select Manage Parking Lots.",
        "Press Edit or Delete to edit or remove a Parking Lot.",
        "Click Save Changes to save edits, or Click Delete to confirm deletion.",
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content
          title="Admin Help Guide"
          titleStyle={styles.headerTitle}
        />
      </Appbar.Header>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Introduction Card */}
        <View style={styles.introCard}>
          <View style={styles.introHeader}>
            <Book color="#388E3C" size={32} />
            <View style={styles.introTextContainer}>
              <Text style={styles.introTitle}>ParkMaster Help</Text>
              <Text style={styles.introSubtitle}>
                Learn how to manage parking lots
              </Text>
            </View>
          </View>
          <Text style={styles.introDescription}>
            This guide will help you understand how to perform common
            administrative tasks in ParkMaster. Tap on any section below to
            view detailed instructions.
          </Text>
        </View>

        {/* Help Sections */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionCategoryTitle}>Admin Tasks</Text>

          {helpSections.map((section) => {
            const isExpanded = expandedSection === section.id;

            return (
              <View key={section.id} style={styles.helpSection}>
                <TouchableOpacity
                  style={styles.sectionHeader}
                  onPress={() => toggleSection(section.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <ChevronRight
                    color="#388E3C"
                    size={24}
                    style={[
                      styles.chevron,
                      isExpanded && styles.chevronExpanded,
                    ]}
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.sectionContent}>
                    <Text style={styles.stepsLabel}>Steps:</Text>
                    {section.steps.map((step, index) => (
                      <View key={index} style={styles.stepContainer}>
                        <View style={styles.stepNumber}>
                          <Text style={styles.stepNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text style={styles.stepText}>{step}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Links Card */}
        <View style={styles.quickLinksCard}>
          <Text style={styles.quickLinksTitle}>Quick Access</Text>
          <Text style={styles.quickLinksSubtitle}>
            Jump directly to these features
          </Text>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/admin/(tabs)/lot-manager/createLotScreen" as any)
            }
          >
            <Text style={styles.quickLinkText}>Create New Parking Lot</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/admin/(tabs)/lot-manager/manage-lots" as any)
            }
          >
            <Text style={styles.quickLinkText}>Manage Parking Lots</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/admin/(tabs)/lot-manager/dashboard" as any)
            }
          >
            <Text style={styles.quickLinkText}>Admin Dashboard</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>
        </View>

        {/* Additional Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need More Help?</Text>
          <Text style={styles.infoText}>
            If you encounter any issues or have questions not covered in this
            guide, please contact your system administrator or refer to the
            full documentation.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    backgroundColor: "#388E3C",
  },
  headerTitle: {
    color: "#fff",
    fontWeight: "700",
  },
  content: {
    flex: 1,
  },
  introCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  introHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  introTextContainer: {
    flex: 1,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  introSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  introDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  sectionsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionCategoryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 12,
  },
  helpSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    flex: 1,
  },
  chevron: {
    transform: [{ rotate: "0deg" }],
  },
  chevronExpanded: {
    transform: [{ rotate: "90deg" }],
  },
  sectionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  stepsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
    marginBottom: 12,
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#388E3C",
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    paddingTop: 4,
  },
  quickLinksCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickLinksTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  quickLinksSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  quickLinkButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  quickLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#388E3C",
  },
  infoCard: {
    backgroundColor: "#f0fdf4",
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#86efac",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#15803d",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#15803d",
    lineHeight: 18,
  },
});