
        import { View, TextInput, KeyboardAvoidingView, Platform } from "react-native";
        import { useTheme } from "hooks/useTheme";
        import { getColors } from "static/color";
        import ContainerTemplate from "component/dashboardComponent/containerTemplate";
        import HeaderComponent from "component/headerComp";
        import EmptyView from "component/emptyview";
        import ButtonComponent from "component/buttoncomponent";
        import { ThemeTextsecond } from "component/ThemeText";
        import { Textstyles } from "static/textFontsize";
        import { useState } from "react";
import InputComponent from "component/controls/textinput";
import PasswordComponent from "component/controls/passwordinput";
        
        const ChangePasswordScreen = () => {
          const { theme } = useTheme();
          const { primaryColor, secondaryTextColor } = getColors(theme);
          const [currentPassword, setCurrentPassword] = useState("");
          const [newPassword, setNewPassword] = useState("");
          const [confirmPassword, setConfirmPassword] = useState("");
        
          const handleChangePassword = () => {
            // Perform validation and password change logic here
            console.log("Change password:", { currentPassword, newPassword, confirmPassword });
          };
        
          return (
            <ContainerTemplate>
              <HeaderComponent title="Change Password" />
              <EmptyView height={20} />
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <View className="w-full px-5 gap-y-5">
                  <View>
                    <ThemeTextsecond size={Textstyles.text_small}>Current Password</ThemeTextsecond>
                    <PasswordComponent value={currentPassword} onChange={setCurrentPassword} color={primaryColor} placeholder="Enter current password" placeholdercolor={secondaryTextColor}/>
                   
                  </View>
                  <View>
                    <ThemeTextsecond size={Textstyles.text_small}>New Password</ThemeTextsecond>
                    <PasswordComponent value={newPassword} onChange={setNewPassword} color={primaryColor} placeholder="Enter new password" placeholdercolor={secondaryTextColor}/>
                
                  </View>
                  <View>
                    <ThemeTextsecond size={Textstyles.text_small}>Confirm New Password</ThemeTextsecond>
                    <PasswordComponent value={confirmPassword} onChange={setConfirmPassword} color={primaryColor} placeholder="Confirm new password" placeholdercolor={secondaryTextColor}/>
                  </View>
                  <EmptyView height={20} />
                  <ButtonComponent
                    color={primaryColor}
                    text="Change Password"
                    textcolor="#ffffff"
                    onPress={handleChangePassword}
                  />
                </View>
              </KeyboardAvoidingView>
            </ContainerTemplate>
          );
        };
        
    
        

export default ChangePasswordScreen