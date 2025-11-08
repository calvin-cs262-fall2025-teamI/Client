// CLIENT/app/utils/validationUtils.ts

export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  /**
   * Validates email addresses
   */
  export const validateEmail = (email: string): ValidationResult => {
    if (!email || email.trim() === "") {
      return { isValid: false, error: "Email is required" };
    }
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Invalid email format" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates license plate numbers
   * Supports multiple formats: ABC-1234, ABC1234, 123-ABC, etc.
   */
  export const validateLicensePlate = (plate: string): ValidationResult => {
    if (!plate || plate.trim() === "") {
      return { isValid: false, error: "License plate is required" };
    }
  
    const trimmedPlate = plate.trim().toUpperCase();
  
    // Check length (most plates are 2-8 characters excluding spaces/dashes)
    const plateWithoutSpecialChars = trimmedPlate.replace(/[-\s]/g, "");
    if (plateWithoutSpecialChars.length < 2 || plateWithoutSpecialChars.length > 8) {
      return { isValid: false, error: "License plate must be 2-8 characters" };
    }
  
    // Must contain at least one letter or number
    if (!/[A-Z0-9]/.test(plateWithoutSpecialChars)) {
      return { isValid: false, error: "License plate must contain letters or numbers" };
    }
  
    // Check for invalid characters
    if (!/^[A-Z0-9\s-]+$/.test(trimmedPlate)) {
      return { isValid: false, error: "License plate contains invalid characters" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates vehicle color
   */
  export const validateVehicleColor = (color: string): ValidationResult => {
    if (!color || color.trim() === "") {
      return { isValid: false, error: "Vehicle color is required" };
    }
  
    const trimmedColor = color.trim();
    
    if (trimmedColor.length < 3 || trimmedColor.length > 20) {
      return { isValid: false, error: "Color must be 3-20 characters" };
    }
  
    // Only letters, spaces, and hyphens allowed
    if (!/^[a-zA-Z\s-]+$/.test(trimmedColor)) {
      return { isValid: false, error: "Color can only contain letters" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates vehicle make
   */
  export const validateVehicleMake = (make: string): ValidationResult => {
    if (!make || make.trim() === "") {
      return { isValid: false, error: "Vehicle make is required" };
    }
  
    const trimmedMake = make.trim();
    
    if (trimmedMake.length < 2 || trimmedMake.length > 30) {
      return { isValid: false, error: "Make must be 2-30 characters" };
    }
  
    // Letters, numbers, spaces, and common characters
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedMake)) {
      return { isValid: false, error: "Make contains invalid characters" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates vehicle model
   */
  export const validateVehicleModel = (model: string): ValidationResult => {
    if (!model || model.trim() === "") {
      return { isValid: false, error: "Vehicle model is required" };
    }
  
    const trimmedModel = model.trim();
    
    if (trimmedModel.length < 1 || trimmedModel.length > 40) {
      return { isValid: false, error: "Model must be 1-40 characters" };
    }
  
    // Letters, numbers, spaces, and common characters
    if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedModel)) {
      return { isValid: false, error: "Model contains invalid characters" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates phone number
   */
  export const validatePhoneNumber = (phone: string): ValidationResult => {
    if (!phone || phone.trim() === "") {
      return { isValid: false, error: "Phone number is required" };
    }
  
    // Remove formatting characters
    const digitsOnly = phone.replace(/[\s\-\(\)\.]/g, "");
  
    // Check if it's all digits
    if (!/^\+?\d+$/.test(digitsOnly)) {
      return { isValid: false, error: "Phone number must contain only digits" };
    }
  
    // Check length (10-15 digits for international support)
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      return { isValid: false, error: "Phone number must be 10-15 digits" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates full name
   */
  export const validateName = (name: string): ValidationResult => {
    if (!name || name.trim() === "") {
      return { isValid: false, error: "Name is required" };
    }
  
    const trimmedName = name.trim();
    
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return { isValid: false, error: "Name must be 2-50 characters" };
    }
  
    // Letters, spaces, hyphens, apostrophes
    if (!/^[a-zA-Z\s'\-]+$/.test(trimmedName)) {
      return { isValid: false, error: "Name can only contain letters" };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates vehicle year
   */
  export const validateVehicleYear = (year: string): ValidationResult => {
    if (!year || year.trim() === "") {
      return { isValid: false, error: "Vehicle year is required" };
    }
  
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
  
    if (isNaN(yearNum)) {
      return { isValid: false, error: "Year must be a number" };
    }
  
    if (yearNum < 1900 || yearNum > currentYear + 1) {
      return { isValid: false, error: `Year must be between 1900 and ${currentYear + 1}` };
    }
  
    return { isValid: true };
  };
  
  /**
   * Validates all user information at once
   */
  export interface UserInformation {
    name?: string;
    email?: string;
    phone?: string;
    licensePlate?: string;
    vehicleColor?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
  }
  
  export interface ValidationErrors {
    [key: string]: string;
  }
  
  export const validateUserInformation = (
    user: UserInformation,
    requiredFields: (keyof UserInformation)[] = []
  ): { isValid: boolean; errors: ValidationErrors } => {
    const errors: ValidationErrors = {};
  
    // Validate each field if provided or required
    if (user.name !== undefined || requiredFields.includes("name")) {
      const result = validateName(user.name || "");
      if (!result.isValid) errors.name = result.error!;
    }
  
    if (user.email !== undefined || requiredFields.includes("email")) {
      const result = validateEmail(user.email || "");
      if (!result.isValid) errors.email = result.error!;
    }
  
    if (user.phone !== undefined || requiredFields.includes("phone")) {
      const result = validatePhoneNumber(user.phone || "");
      if (!result.isValid) errors.phone = result.error!;
    }
  
    if (user.licensePlate !== undefined || requiredFields.includes("licensePlate")) {
      const result = validateLicensePlate(user.licensePlate || "");
      if (!result.isValid) errors.licensePlate = result.error!;
    }
  
    if (user.vehicleColor !== undefined || requiredFields.includes("vehicleColor")) {
      const result = validateVehicleColor(user.vehicleColor || "");
      if (!result.isValid) errors.vehicleColor = result.error!;
    }
  
    if (user.vehicleMake !== undefined || requiredFields.includes("vehicleMake")) {
      const result = validateVehicleMake(user.vehicleMake || "");
      if (!result.isValid) errors.vehicleMake = result.error!;
    }
  
    if (user.vehicleModel !== undefined || requiredFields.includes("vehicleModel")) {
      const result = validateVehicleModel(user.vehicleModel || "");
      if (!result.isValid) errors.vehicleModel = result.error!;
    }
  
    if (user.vehicleYear !== undefined || requiredFields.includes("vehicleYear")) {
      const result = validateVehicleYear(user.vehicleYear || "");
      if (!result.isValid) errors.vehicleYear = result.error!;
    }
  
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };
  
  // Utility function to format license plate
  export const formatLicensePlate = (plate: string): string => {
    return plate.trim().toUpperCase();
  };
  
  // Utility function to format phone number
  export const formatPhoneNumber = (phone: string): string => {
    const digitsOnly = phone.replace(/\D/g, "");
    
    if (digitsOnly.length === 10) {
      return `+1 (${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
    }
    
    return phone;
  };

  // Default export to prevent routing warnings
  const ValidationUtils = {
    validateEmail,
    validateLicensePlate,
    validateVehicleColor,
    validateVehicleMake,
    validateVehicleModel,
    validatePhoneNumber,
    validateName,
    validateVehicleYear,
    validateUserInformation,
    formatLicensePlate,
    formatPhoneNumber,
  };

  export default ValidationUtils;