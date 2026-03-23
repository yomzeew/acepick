import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { getSkillsFn, getMySkillsFn, addProfessionalSkillsFn, removeProfessionalSkillFn } from 'services/skillsService';
import { useTheme } from 'hooks/useTheme';
import { getColors } from 'static/color';
import { Textstyles } from 'static/textFontsize';

interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

interface ProfessionalSkill {
  id: number;
  professionalId: number;
  skillId: number;
  proficiency: string;
  yearsOfExp: number;
  skill: Skill;
}

const SkillsManagement = () => {
  const { theme } = useTheme();
  const { primaryColor, secondaryTextColor, selectioncardColor, borderColor, successColor, backgroundColortwo } = getColors(theme);
  const queryClient = useQueryClient();

  // Fetch available skills
  const { data: availableSkills, isLoading: skillsLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => getSkillsFn(),
  });

  // Fetch my skills
  const { data: mySkills, isLoading: mySkillsLoading, refetch: refetchMySkills } = useQuery({
    queryKey: ['mySkills'],
    queryFn: getMySkillsFn,
  });

  // Add skills mutation
  const addSkillsMutation = useMutation({
    mutationFn: addProfessionalSkillsFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
      Alert.alert('Success', 'Skills added successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to add skills. Please try again.');
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: removeProfessionalSkillFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySkills'] });
      Alert.alert('Success', 'Skill removed successfully!');
    },
    onError: (error: any) => {
      Alert.alert('Error', 'Failed to remove skill. Please try again.');
    },
  });

  const [selectedSkills, setSelectedSkills] = useState<{ [key: number]: { proficiency: string; yearsOfExp: number } }>({});
  const [showAddSkills, setShowAddSkills] = useState(false);

  // Group skills by category
  const skillsByCategory = availableSkills?.reduce((acc: any, skill: Skill) => {
    const category = skill.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {}) || {};

  const mySkillIds = mySkills?.map((ps: ProfessionalSkill) => ps.skillId) || [];

  const handleSkillToggle = (skillId: number) => {
    if (mySkillIds.includes(skillId)) {
      // Remove skill
      const professionalSkill = mySkills?.find((ps: ProfessionalSkill) => ps.skillId === skillId);
      if (professionalSkill) {
        removeSkillMutation.mutate(professionalSkill.id);
      }
    } else {
      // Add to selection
      setSelectedSkills(prev => ({
        ...prev,
        [skillId]: prev[skillId] ? { ...prev[skillId] } : { proficiency: 'Intermediate', yearsOfExp: 1 }
      }));
    }
  };

  const handleProficiencyChange = (skillId: number, proficiency: string) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillId]: { ...prev[skillId], proficiency }
    }));
  };

  const handleYearsChange = (skillId: number, years: number) => {
    setSelectedSkills(prev => ({
      ...prev,
      [skillId]: { ...prev[skillId], yearsOfExp: years }
    }));
  };

  const handleAddSkills = () => {
    const skillsToAdd = Object.entries(selectedSkills).map(([skillId, data]) => ({
      skillId: Number(skillId),
      proficiency: data.proficiency,
      yearsOfExp: data.yearsOfExp
    }));

    if (skillsToAdd.length === 0) {
      Alert.alert('Info', 'Please select at least one skill to add.');
      return;
    }

    addSkillsMutation.mutate(skillsToAdd);
    setSelectedSkills({});
    setShowAddSkills(false);
  };

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  if (skillsLoading || mySkillsLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={{ color: secondaryTextColor, marginTop: 10 }}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4">
      {/* My Current Skills */}
      <View className="mb-6">
        <Text style={{ color: primaryColor, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
          My Skills
        </Text>
        
        {mySkills?.length === 0 ? (
          <View className="bg-gray-50 p-4 rounded-lg">
            <Text style={{ color: secondaryTextColor, textAlign: 'center' }}>
              No skills added yet. Tap "Add Skills" to get started!
            </Text>
          </View>
        ) : (
          <View className="space-y-3">
            {mySkills?.map((professionalSkill: ProfessionalSkill) => (
              <View key={professionalSkill.id} className="bg-white p-4 rounded-lg border" style={{ borderColor }}>
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text style={{ color: primaryColor, fontSize: 16, fontWeight: '600' }}>
                      {professionalSkill.skill.name}
                    </Text>
                    <Text style={{ color: secondaryTextColor, fontSize: 12, marginTop: 2 }}>
                      {professionalSkill.skill.category}
                    </Text>
                    <View className="flex-row mt-2" style={{ gap: 16 }}>
                      <Text style={{ color: secondaryTextColor, fontSize: 12 }}>
                        <Text style={{ fontWeight: '600' }}>Proficiency:</Text> {professionalSkill.proficiency}
                      </Text>
                      <Text style={{ color: secondaryTextColor, fontSize: 12 }}>
                        <Text style={{ fontWeight: '600' }}>Experience:</Text> {professionalSkill.yearsOfExp} {professionalSkill.yearsOfExp === 1 ? 'year' : 'years'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleSkillToggle(professionalSkill.skillId)}
                    className="p-2"
                  >
                    <Ionicons name="remove-circle" size={20} color={backgroundColortwo} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Skills Button */}
      <TouchableOpacity
        onPress={() => setShowAddSkills(!showAddSkills)}
        className="bg-blue-500 p-4 rounded-lg mb-6"
        style={{ backgroundColor: primaryColor }}
      >
        <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
          {showAddSkills ? 'Cancel' : 'Add Skills'}
        </Text>
      </TouchableOpacity>

      {/* Add Skills Section */}
      {showAddSkills && (
        <View className="space-y-4">
          <Text style={{ color: primaryColor, fontSize: 16, fontWeight: '600' }}>
            Select Skills to Add
          </Text>

          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <View key={category} className="mb-4">
              <Text style={{ color: secondaryTextColor, fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                {category}
              </Text>
              <View className="space-y-2">
                {(skills as Skill[]).map((skill) => {
                  const isSelected = selectedSkills[skill.id] !== undefined;
                  const isAlreadyAdded = mySkillIds.includes(skill.id);
                  
                  return (
                    <View
                      key={skill.id}
                      className={`p-3 rounded-lg border ${isAlreadyAdded ? 'opacity-50' : ''}`}
                      style={{
                        borderColor: isSelected ? primaryColor : borderColor,
                        backgroundColor: isSelected ? primaryColor + '10' : 'white'
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => !isAlreadyAdded && handleSkillToggle(skill.id)}
                        disabled={isAlreadyAdded}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text style={{
                            color: isAlreadyAdded ? secondaryTextColor : primaryColor,
                            fontSize: 14,
                            fontWeight: '600'
                          }}>
                            {skill.name}
                            {isAlreadyAdded && ' (Already Added)'}
                          </Text>
                          <Ionicons
                            name={isSelected ? 'checkmark-circle' : 'add-circle'}
                            size={20}
                            color={isSelected ? primaryColor : (isAlreadyAdded ? secondaryTextColor : borderColor)}
                          />
                        </View>
                      </TouchableOpacity>

                      {isSelected && (
                        <View className="mt-3 space-y-2">
                          {/* Proficiency Selector */}
                          <View>
                            <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 4 }}>Proficiency</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                              <View className="flex-row" style={{ gap: 8 }}>
                                {proficiencyLevels.map((level) => (
                                  <TouchableOpacity
                                    key={level}
                                    onPress={() => handleProficiencyChange(skill.id, level)}
                                    className="px-3 py-1 rounded-full border"
                                    style={{
                                      backgroundColor: selectedSkills[skill.id]?.proficiency === level ? primaryColor : 'transparent',
                                      borderColor: primaryColor
                                    }}
                                  >
                                    <Text style={{
                                      color: selectedSkills[skill.id]?.proficiency === level ? 'white' : primaryColor,
                                      fontSize: 11,
                                      fontWeight: '500'
                                    }}>
                                      {level}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </ScrollView>
                          </View>

                          {/* Years of Experience */}
                          <View>
                            <Text style={{ color: secondaryTextColor, fontSize: 12, marginBottom: 4 }}>
                              Years of Experience: {selectedSkills[skill.id]?.yearsOfExp || 1}
                            </Text>
                            <View className="flex-row items-center" style={{ gap: 12 }}>
                              <TouchableOpacity
                                onPress={() => handleYearsChange(skill.id, Math.max(1, (selectedSkills[skill.id]?.yearsOfExp || 1) - 1))}
                                className="w-8 h-8 rounded-full border items-center justify-center"
                                style={{ borderColor }}
                              >
                                <Text style={{ color: primaryColor, fontSize: 16 }}>-</Text>
                              </TouchableOpacity>
                              <Text style={{ color: primaryColor, fontSize: 16, fontWeight: '600' }}>
                                {selectedSkills[skill.id]?.yearsOfExp || 1}
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleYearsChange(skill.id, (selectedSkills[skill.id]?.yearsOfExp || 1) + 1)}
                                className="w-8 h-8 rounded-full border items-center justify-center"
                                style={{ borderColor }}
                              >
                                <Text style={{ color: primaryColor, fontSize: 16 }}>+</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Add Selected Skills Button */}
          {Object.keys(selectedSkills).length > 0 && (
            <TouchableOpacity
              onPress={handleAddSkills}
              className="bg-green-500 p-4 rounded-lg"
              style={{ backgroundColor: successColor }}
              disabled={addSkillsMutation.isPending}
            >
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                {addSkillsMutation.isPending ? 'Adding...' : `Add ${Object.keys(selectedSkills).length} Skill${Object.keys(selectedSkills).length > 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default SkillsManagement;
