import { headerStyles } from "@/utils/globalStyles";
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

export default function ClientHelpScreen() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const helpSections: HelpSection[] = [
    {
      id: "add-vehicle",
      title: "1.1 Add a Vehicle",
      steps: [
        "Select Profile on the bottom navigation bar.",
        "Select +Add located next to My Vehicles.",
        "Enter vehicle information.",
        "Click Add Vehicle.",
      ],
    },
    {
      id: "view-schedule",
      title: "1.2 View Parking Schedule",
      steps: [
        "Select Home on the bottom navigation bar.",
        "The current parking schedule is displayed under Your Schedule.",
      ],
    },
    {
      id: "make-reservation",
      title: "1.3 Make a Reservation",
      steps: [
        "Select Schedule on the bottom navigation bar.",
        "Tap Request New Spot button.",
        "Enter Date, Start Time, and End Time.",
        "Select a Parking Lot.",
        "Optional: Enable Recurring Weekly and select days.",
        "Click Submit Request.",
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <View style={styles.container}>
    <View style={headerStyles.header}>
        <View>
          <Text style={headerStyles.headerTitle}>Help Guide</Text>
          <Text style={headerStyles.headerSubtitle}>How to use ParkMaster</Text>
        </View>
      </View>

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
                Learn how to use ParkMaster
              </Text>
            </View>
          </View>
          <Text style={styles.introDescription}>
            This guide will help you understand how to manage your parking
            reservations, vehicles, and profile. Tap on any section below to
            view detailed instructions.
          </Text>
        </View>

        {/* Help Sections */}
        <View style={styles.sectionsContainer}>
          <Text style={styles.sectionCategoryTitle}>User Tasks</Text>

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
              router.push("/user/(tabs)/home/dashboard" as any)
            }
          >
            <Text style={styles.quickLinkText}>Home Dashboard</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/user/(tabs)/schedule/reservation-request" as any)
            }
          >
            <Text style={styles.quickLinkText}>Make a Reservation</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/user/(tabs)/profile/view_profile" as any)
            }
          >
            <Text style={styles.quickLinkText}>View Profile</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickLinkButton}
            onPress={() =>
              router.push("/user/(tabs)/home/view-parking-lots" as any)
            }
          >
            <Text style={styles.quickLinkText}>View Parking Lots</Text>
            <ChevronRight color="#388E3C" size={20} />
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Helpful Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Request parking spots at least 24 hours in advance
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Keep your vehicle information up to date
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Cancel unused reservations to help others
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>
              Arrive within 15 minutes of your start time
            </Text>
          </View>
        </View>

        {/* Additional Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Need More Help?</Text>
          <Text style={styles.infoText}>
            If you encounter any issues or have questions not covered in this
            guide, please use the Report Issue feature from the Home screen
            or contact your administrator.
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
  tipsCard: {
    backgroundColor: "#fffbeb",
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400e",
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: "#92400e",
    fontWeight: "700",
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
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