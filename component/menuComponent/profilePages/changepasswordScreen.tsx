import { View, TextInput, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useTheme } from "hooks/useTheme";
import { getColors } from "static/color";
import ContainerTemplate from "component/dashboardComponent/containerTemplate";
import HeaderComponent from "component/headerComp";
import EmptyView from "component/emptyview";
import ButtonComponent from "component/buttoncomponent";
import { ThemeText, ThemeTextsecond } from "component/ThemeText";
import { Textstyles } from "static/textFontsize";
import { useState, useEffect } from "react";
import InputComponent from "component/controls/textinput";
import PasswordComponent from "component/controls/passwordinput";
import { AlertMessageBanner } from "component/AlertMessageBanner";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";

const ChangePasswordScreen = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor } = getColors(theme);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const user = useSelector((state: RootState) => state.auth.user);

  // Auto-clear messages after 4 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await axios.put("/api/user/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      let msg = "Failed to change password";
      if (error?.response?.data?.message) {
        msg = error.response.data.message;
      } else if (error?.response?.status === 400) {
        msg = "Current password is incorrect";
      } else if (error?.response?.status === 401) {
        msg = "You are not authorized to perform this action";
      } else if (error?.response?.status >= 500) {
        msg = "Server error. Please try again later";
      }
      setErrorMessage(msg);
    },
  });

  const handleChangePassword = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!currentPassword) {
      setErrorMessage("Please enter your current password");
      return;
    }

    if (!newPassword) {
      setErrorMessage("Please enter a new password");
      return;
    }

    if (!confirmPassword) {
      setErrorMessage("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New passwords do not match");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage("New password must be different from current password");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    // Change password
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <ContainerTemplate>
      {successMessage && (
        <AlertMessageBanner type="success" message={successMessage} />
      )}
      {errorMessage && (
        <AlertMessageBanner type="error" message={errorMessage} />
      )}
      
      <HeaderComponent title="Change Password" />
      <EmptyView height={20} />
      
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="w-full px-5 gap-y-5">
          <View>
            <ThemeTextsecond size={Textstyles.text_small}>Current Password</ThemeTextsecond>
            <PasswordComponent 
              value={currentPassword} 
              onChange={setCurrentPassword} 
              color={primaryColor} 
              placeholder="Enter current password" 
              placeholdercolor={secondaryTextColor}
            />
          </View>
          
          <View>
            <ThemeTextsecond size={Textstyles.text_small}>New Password</ThemeTextsecond>
            <PasswordComponent 
              value={newPassword} 
              onChange={setNewPassword} 
              color={primaryColor} 
              placeholder="Enter new password" 
              placeholdercolor={secondaryTextColor}
            />
            <ThemeTextsecond size={Textstyles.text_xxxsmall}>
              Must be at least 8 characters with uppercase, lowercase, and number
            </ThemeTextsecond>
          </View>
          
          <View>
            <ThemeTextsecond size={Textstyles.text_small}>Confirm New Password</ThemeTextsecond>
            <PasswordComponent 
              value={confirmPassword} 
              onChange={setConfirmPassword} 
              color={primaryColor} 
              placeholder="Confirm new password" 
              placeholdercolor={secondaryTextColor}
            />
          </View>
          
          <EmptyView height={20} />
          
          <ButtonComponent
            color={primaryColor}
            text={changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
            textcolor="#ffffff"
            onPress={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          />
          
          {changePasswordMutation.isPending && (
            <View className="items-center justify-center mt-4">
              <ActivityIndicator size="small" color={primaryColor} />
              <ThemeTextsecond size={Textstyles.text_xsmall}>
                Updating your password...
              </ThemeTextsecond>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ContainerTemplate>
  );
};

export default ChangePasswordScreen;