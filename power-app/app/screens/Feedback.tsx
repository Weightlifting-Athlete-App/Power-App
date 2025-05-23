import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { getUserData } from '../services/api';

interface FeedbackProps {
  username: string;
}

interface UserData {
  username: string;
  age: number;
  yrs_experience: number;
  body_weight: number;
  lifted_weight: number;
  pose_data: {
    angles: { [key: string]: number };
    correctness: { [key: string]: number };
  };
  injury_risk: { [key: string]: string };
  predicted_performance: number;
  performance_category: string;
}

const Feedback: React.FC<FeedbackProps> = ({ username }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserData("sahan02"); // 🔴 Hardcoded for testing
        // const data = await getUserData(username); // ✅ Dynamic from props
        console.log("Fetched Data:", data);
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
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

  const { angles } = userData.pose_data;
  const { injury_risk } = userData;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>User Details:</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.infoText}>Name: {userData.username}</Text>
              <Text style={styles.infoText}>Age: {userData.age}</Text>
              <Text style={styles.infoText}>Experience: {userData.yrs_experience}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.infoText}>Body Weight: {userData.body_weight} kg</Text>
              <Text style={styles.infoText}>Lifted Weight: {userData.lifted_weight} kg</Text>
            </View>
          </View>
        </View>

        <Text style={styles.header}>Predicted Performance:</Text>
        <View style={styles.predictedPerformanceContainer}>
          <Text style={styles.performanceScoreText}>
            Score: {userData.predicted_performance.toFixed(2)}%
          </Text>
          <Text style={styles.performanceCategoryText}>
            Category: {userData.performance_category}
          </Text>
        </View>

        <Text style={styles.header}>Pose Analysis and Injury Risk:</Text>
        {Object.keys(angles).map((key) => (
          <View key={key} style={styles.riskContainer}>
            <Text style={styles.angleText}>
              {key.replace('_', ' ').toUpperCase()}: {angles[key].toFixed(2)}°
            </Text>
            <Text style={styles.riskText}>
              Risk Level: {injury_risk && injury_risk[key] ? injury_risk[key] : 'No risk data'}
            </Text>
            <Text style={styles.feedbackText}>
              {generateFeedback(key, angles[key], injury_risk && injury_risk[key], userData)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const generateFeedback = (joint: string, angle: number, riskLevel?: string, userData?: UserData): string => {
  const { yrs_experience = 0, body_weight = 0, predicted_performance = 0, performance_category = '' } = userData || {};

  let feedback = '';

  switch (joint) {
    case 'shoulder_angle':
      if (yrs_experience < 2) {
        feedback = riskLevel === '🔴 High Risk'
          ? 'Your shoulder angle suggests potential impingement. Focus on scapular stability and shoulder mobility. Consider working on rotator cuff exercises.'
          : 'Shoulder positioning is good. Work on scapular control and overhead mobility to enhance your performance.';
      } else {
        feedback = riskLevel === '🔴 High Risk'
          ? 'High risk of shoulder impingement. Consider lowering the barbell position to reduce shoulder strain.'
          : 'Good shoulder alignment. Work on maintaining your scapular retraction during lifts for better stability.';
      }
      break;

    case 'knees_angle':
      if (body_weight > 100) {
        feedback = riskLevel === '🟠 Moderate Risk'
          ? 'Your knee angle suggests deep knee flexion. Ensure stability and control. Improve your ankle mobility and strengthen your quads.'
          : 'Knee positioning is safe. Focus on engaging your glutes more during squats, and work on ankle mobility.';
      } else {
        feedback = riskLevel === '🟠 Moderate Risk'
          ? 'Deep knee flexion may cause strain. Work on improving ankle mobility and quadriceps strength.'
          : 'Knee position is good, but make sure your feet are properly aligned to avoid knee strain.';
      }
      break;

    case 'back_angle':
      if (predicted_performance < 60) {
        feedback = riskLevel === '🔴 High Risk'
          ? 'Your back angle suggests possible hyperextension. Focus on core stability and engage your lats for a neutral spine.'
          : 'Back angle is good. Focus on core bracing and posterior chain exercises to improve your deadlift technique.';
      } else {
        feedback = riskLevel === '🔴 High Risk'
          ? 'Back hyperextension is a serious risk. Ensure your spine stays neutral by bracing your core and using correct hip hinge form.'
          : 'Good back positioning. Strengthen your lower back and core for more control in heavy lifts.';
      }
      break;

    default:
      feedback = 'Keep practicing with proper form and aim for continuous improvement!';
  }

  switch (performance_category) {
    case 'Beginner':
      feedback += ' As a beginner, focus on mastering the basics and building a strong foundation.';
      break;
    case 'Intermediate':
      feedback += ' As an intermediate lifter, work on refining your technique and increasing your strength.';
      break;
    case 'Advanced':
      feedback += ' As an advanced lifter, focus on optimizing your performance and addressing any weaknesses.';
      break;
    default:
      feedback += ' Keep up the good work and strive for continuous improvement!';
  }

  return feedback;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 18,
    color: 'gray',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    width: '50%',
  },
  infoText: {
    fontSize: 13,
    marginBottom: 10,
    color: '#333',
    fontFamily: 'times new roman',
  },
  angleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  riskText: {
    fontSize: 16,
    color: '#FF5733',
  },
  feedbackText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 5,
    color: '#555',
  },
  riskContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  predictedPerformanceContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  performanceCategoryText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  performanceScoreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5733',
  },
});

export default Feedback;
