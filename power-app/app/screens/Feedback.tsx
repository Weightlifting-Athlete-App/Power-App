import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getUserData } from '../services/api';

interface FeedbackProps {
  username: string;
}

const Feedback: React.FC<FeedbackProps> = ({ username }) => {
  interface UserData {
    username: string;
    age: number;
    yrs_experience: number;
    body_weight: number;
    lifted_weight: number;
    pose_data: { [key: string]: number };
    injury_risk: { [key: string]: string };
    predicted_performance: number;
    performance_category: string;
  }
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData(username);
        setUserData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [username]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userData) {
    return <Text>No data available.</Text>;
  }

  const { pose_data, injury_risk, predicted_performance, performance_category } = userData;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>User Profile:</Text>
      <Text>Username: {userData.username}</Text>
      <Text>Age: {userData.age}</Text>
      <Text>Years of Experience: {userData.yrs_experience}</Text>
      <Text>Body Weight: {userData.body_weight} kg</Text>
      <Text>Lifted Weight: {userData.lifted_weight} kg</Text>

      <Text style={styles.header}>Pose Analysis and Injury Risk:</Text>
      {Object.keys(pose_data).map((key) => (
        <View key={key} style={styles.riskContainer}>
          <Text style={styles.angleText}>
            {key.replace('_', ' ').toUpperCase()}: {pose_data[key]}°
          </Text>
          <Text style={styles.riskText}>
            Risk Level: {injury_risk[key]}
          </Text>
          <Text style={styles.feedbackText}>
            {generateFeedback(key, pose_data[key], injury_risk[key])}
          </Text>
        </View>
      ))}

      <Text style={styles.header}>Predicted Performance:</Text>
      <Text>Score: {predicted_performance.toFixed(2)}%</Text>
      <Text>Category: {performance_category}</Text>
    </View>
  );
};

const generateFeedback = (joint: string, angle: number, riskLevel: string): string => {
  switch (joint) {
    case 'shoulder_angle':
      return riskLevel === '🔴 High Risk'
        ? 'An extremely low shoulder angle may indicate improper shoulder positioning, potentially leading to shoulder impingement or strain. Ensure shoulders are properly aligned and engaged during lifts.'
        : 'Shoulder positioning appears to be within a safe range.';
    case 'knees_angle':
      return riskLevel === '🟠 Moderate Risk'
        ? 'A knee angle less than 90° suggests deep knee flexion, which can increase stress on the knee joint. While deep squats can be beneficial, they should be performed with caution and proper technique to avoid undue stress.'
        : 'Knee positioning appears to be within a safe range.';
    case 'back_angle':
      return riskLevel === '🔴 High Risk'
        ? 'A back angle close to 180° indicates a nearly straight back, which is generally good. However, if this angle is due to hyperextension, it can lead to lumbar spine issues. Ensure a neutral spine position is maintained.'
        : 'Back positioning appears to be within a safe range.';
    case 'wrist_angle':
      return riskLevel === '🟢 Low Risk'
        ? 'A wrist angle of 170° is within a safe range, indicating proper wrist positioning during lifts.'
        : 'Wrist positioning may need adjustment to ensure safety.';
    case 'hips_angle':
      return riskLevel === '🔴 High Risk'
        ? 'A hips angle close to 180° suggests a nearly straight hip position. If this results from hyperextension, it can strain the hip flexors and lower back. Aim for a neutral hip position to distribute forces evenly.'
        : 'Hip positioning appears to be within a safe range.';
    default:
      return 'No specific feedback available.';
  }
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  riskContainer: {
    marginVertical: 5,
  },
  angleText: {
    fontSize: 16,
  },
  riskText: {
    fontSize: 16,
    color: 'red',
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default Feedback;
