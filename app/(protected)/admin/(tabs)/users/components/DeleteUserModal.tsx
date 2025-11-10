// CLIENT/app/screens/admin/(tabs)/users/components/DeleteUserModal.tsx
import { AlertTriangle, X } from "lucide-react-native";
import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface DeleteUserModalProps {
  visible: boolean;
  userName: string;
  vehicleCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserModal({
  visible,
  userName,
  vehicleCount,
  onClose,
  onConfirm,
}: DeleteUserModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Delete User</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X color="#64748b" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.deleteModalBody}>
            <View style={styles.warningIconContainer}>
              <AlertTriangle color="#ef4444" size={48} />
            </View>
            <Text style={styles.deleteWarningTitle}>
              Are you absolutely sure?
            </Text>
            <Text style={styles.deleteWarningText}>
              This action cannot be undone. This will permanently delete the user
              account for <Text style={styles.deleteBoldText}>{userName}</Text> and
              remove all associated data including:
            </Text>
            <View style={styles.deleteWarningList}>
              <Text style={styles.deleteWarningListItem}>
                • Profile information
              </Text>
              <Text style={styles.deleteWarningListItem}>
                • {vehicleCount} registered vehicle(s)
              </Text>
              <Text style={styles.deleteWarningListItem}>
                • Access permissions
              </Text>
              <Text style={styles.deleteWarningListItem}>• Activity history</Text>
            </View>
            <View style={styles.deleteConfirmBox}>
              <Text style={styles.deleteConfirmText}>
                Please confirm you want to proceed with deleting this user.
              </Text>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteButton} onPress={onConfirm}>
              <Text style={styles.deleteButtonText}>Delete User</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  closeButton: {
    padding: 4,
  },
  deleteModalBody: {
    padding: 20,
  },
  warningIconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  deleteWarningTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "center",
    marginBottom: 12,
  },
  deleteWarningText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  deleteBoldText: {
    fontWeight: "700",
    color: "#0f172a",
  },
  deleteWarningList: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  deleteWarningListItem: {
    fontSize: 14,
    color: "#7f1d1d",
    marginBottom: 8,
    lineHeight: 20,
  },
  deleteConfirmBox: {
    backgroundColor: "#fff7ed",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  deleteConfirmText: {
    fontSize: 13,
    color: "#9a3412",
    lineHeight: 18,
    textAlign: "center",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  deleteButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});