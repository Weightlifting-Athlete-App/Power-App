// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// interface PoseData {
//   shoulderAngle: number;
//   // Add other properties for knee, back, wrist, and hips
// }

// const FeedbackScreen = ({ poseData }: { poseData: PoseData }) => {
//   const feedback = generateFeedback(poseData);

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Performance Feedback</Text>
//       <View style={styles.feedbackItem}>
//         <Text style={styles.label}>Shoulder Angle:</Text>
//         <Text style={styles.value}>{poseData.shoulderAngle}°</Text>
//         <Text style={styles.risk}>{feedback.shoulder.riskLevel}</Text>
//         <Text style={styles.message}>{feedback.shoulder.message}</Text>
//       </View>
//       {/* Render additional feedback items for knee, back, wrist, and hips */}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
//   feedbackItem: { marginBottom: 15 },
//   label: { fontSize: 18, fontWeight: 'bold' },
//   value: { fontSize: 18 },
//   risk: { fontSize: 18, fontWeight: 'bold' },
//   message: { fontSize: 16 },
// });

// function generateFeedback(poseData: any) {
//     const feedback = {
//         shoulder: {
//             riskLevel: '',
//             message: ''
//         },
//         // Add similar structure for knee, back, wrist, and hips
//     };

//     // Example logic for shoulder feedback
//     if (poseData.shoulderAngle > 90) {
//         feedback.shoulder.riskLevel = 'High Risk';
//         feedback.shoulder.message = 'Your shoulder angle is too high. Consider lowering it to reduce strain.';
//     } else if (poseData.shoulderAngle > 60) {
//         feedback.shoulder.riskLevel = 'Moderate Risk';
//         feedback.shoulder.message = 'Your shoulder angle is moderate. Try to keep it below 60 degrees.';
//     } else {
//         feedback.shoulder.riskLevel = 'Low Risk';
//         feedback.shoulder.message = 'Your shoulder angle is low. Keep up the good work!';
//     }

//     return feedback;
// }

