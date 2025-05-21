import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getUserData } from '../services/api'; // Adjust the import path as necessary
interface FeedbackProps {
  username: string;
}

interface PoseData {
  shoulderAngle: number;
  // Add more pose properties if needed
}

const Feedback: React.FC<FeedbackProps> = ({ username }) => {
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoseData = async () => {
      try {
        const data = await getUserData(username);
        setPoseData(data as PoseData);
      } catch (error) {
        console.error('Error fetching pose data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoseData();
  }, [username]);

  if (loading || !poseData) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const feedback = generateFeedback(poseData);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Performance Feedback</Text>
      <View style={styles.feedbackItem}>
        <Text style={styles.label}>Shoulder Angle:</Text>
        <Text style={styles.value}>{poseData.shoulderAngle}°</Text>
        <Text style={styles.risk}>{feedback.shoulder.riskLevel}</Text>
        <Text style={styles.message}>{feedback.shoulder.message}</Text>
      </View>
      {/* Add feedback for other joints here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  feedbackItem: { marginBottom: 15 },
  label: { fontSize: 18, fontWeight: 'bold' },
  value: { fontSize: 18 },
  risk: { fontSize: 18, fontWeight: 'bold' },
  message: { fontSize: 16 },
});

function generateFeedback(poseData: PoseData) {
  const feedback = {
    shoulder: {
      riskLevel: '',
      message: '',
    },
  };

  if (poseData.shoulderAngle > 90) {
    feedback.shoulder.riskLevel = 'High Risk';
    feedback.shoulder.message = 'Shoulder angle is too high. Lower it to reduce strain.';
  } else if (poseData.shoulderAngle > 60) {
    feedback.shoulder.riskLevel = 'Moderate Risk';
    feedback.shoulder.message = 'Try to keep shoulder angle below 60° for safety.';
  } else {
    feedback.shoulder.riskLevel = 'Low Risk';
    feedback.shoulder.message = 'Shoulder angle is within safe limits. Great job!';
  }

  return feedback;
}

export default Feedback;
