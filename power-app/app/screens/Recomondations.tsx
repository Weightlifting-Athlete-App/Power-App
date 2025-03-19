import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PerformanceProps {
  username: string;
}

interface PerformanceData {
  username: string;
  avg_performance: number;
  performance_trend: number[];
  highest_lift: number;
  lowest_risk: string;
  highest_risk: string;
}

const OverallPerformance: React.FC<PerformanceProps> = ({ username }) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateOverallPerformance = () => {
      const data = {
        username: "Ashan",
        age: 35,
        age_start: 20,
        yrs_experience: 15,
        sex_encoded: 1,
        body_weight: 130,
        lifted_weight: 160,
        predicted_performance: 69.32578571428571
      };
      
      const experience_score = (data.yrs_experience / data.age) * 100;
      const strength_score = (data.lifted_weight / data.body_weight) * 100;
      const overall_performance = (0.4 * strength_score) + 
                                  (0.3 * experience_score) + 
                                  (0.3 * data.predicted_performance);
      
      return {
        username: data.username,
        avg_performance: overall_performance,
        performance_trend: [70, 75, 80, overall_performance],
        highest_lift: data.lifted_weight,
        lowest_risk: "Lower Back",
        highest_risk: "Knees",
      };
    };
    
    setTimeout(() => {
      setPerformanceData(calculateOverallPerformance());
      setLoading(false);
    }, 1000);
  }, [username]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!performanceData) {
    return <Text>No performance data available.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Overall Performance</Text>
        <View style={styles.card}>
          <Text style={styles.infoText}>Username: {performanceData.username}</Text>
          <Text style={styles.infoText}>Average Performance: {performanceData.avg_performance.toFixed(2)}%</Text>
          <Text style={styles.infoText}>Highest Lifted Weight: {performanceData.highest_lift} kg</Text>
          <Text style={styles.infoText}>Lowest Injury Risk Area: {performanceData.lowest_risk}</Text>
          <Text style={styles.infoText}>Highest Injury Risk Area: {performanceData.highest_risk}</Text>
        </View>

        <Text style={styles.header}>Performance Trend</Text>
        <LineChart
          data={{
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{ data: performanceData.performance_trend }],
          }}
          width={350}
          height={220}
          yAxisSuffix="%"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#f5f5f5',
            backgroundGradientTo: '#f5f5f5',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
          style={styles.chart}
        />
      </View>
    </ScrollView>
  );
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
  infoText: {
    fontSize: 14,
    marginBottom: 10,
    color: '#333',
  },
  chart: {
    marginVertical: 10,
    borderRadius: 10,
  },
});

export default OverallPerformance;

// import React, { useEffect, useState } from 'react';
// import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
// import { LineChart } from 'react-native-chart-kit';
// import { getPerformanceData } from '../services/api';  // Assuming you have this API function

// interface PerformanceProps {
//   username: string;
// }

// interface PerformanceData {
//   username: string;
//   avg_performance: number;
//   performance_trend: number[];
//   highest_lift: number;
//   lowest_risk: string;
//   highest_risk: string;
// }

// const OverallPerformance: React.FC<PerformanceProps> = ({ username }) => {
//   const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchPerformanceData = async () => {
//       try {
//         const data = await getPerformanceData(username); // Fetch the data from the API
//         console.log("Fetched Performance Data:", data);

//         // If needed, you can calculate overall performance based on the fetched data here
//         const overallPerformance = calculateOverallPerformance(data);

//         setPerformanceData(overallPerformance);
//       } catch (error) {
//         console.error("Error fetching performance data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPerformanceData();
//   }, [username]);

//   // Assuming you might want to calculate overall performance based on fetched data
//   const calculateOverallPerformance = (data: any) => {
//     const experience_score = (data.yrs_experience / data.age) * 100;
//     const strength_score = (data.lifted_weight / data.body_weight) * 100;
//     const overall_performance = (0.4 * strength_score) + 
//                                 (0.3 * experience_score) + 
//                                 (0.3 * data.predicted_performance);

//     return {
//       username: data.username,
//       avg_performance: overall_performance,
//       performance_trend: [70, 75, 80, overall_performance], // Example trend, replace with actual data
//       highest_lift: data.lifted_weight,
//       lowest_risk: "Lower Back", // Example risk areas, replace with actual data
//       highest_risk: "Knees",
//     };
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

//   if (!performanceData) {
//     return <Text>No performance data available.</Text>;
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.scrollContainer}>
//       <View style={styles.container}>
//         <Text style={styles.header}>Overall Performance</Text>
//         <View style={styles.card}>
//           <Text style={styles.infoText}>Username: {performanceData.username}</Text>
//           <Text style={styles.infoText}>Average Performance: {performanceData.avg_performance.toFixed(2)}%</Text>
//           <Text style={styles.infoText}>Highest Lifted Weight: {performanceData.highest_lift} kg</Text>
//           <Text style={styles.infoText}>Lowest Injury Risk Area: {performanceData.lowest_risk}</Text>
//           <Text style={styles.infoText}>Highest Injury Risk Area: {performanceData.highest_risk}</Text>
//         </View>

//         <Text style={styles.header}>Performance Trend</Text>
//         <LineChart
//           data={{
//             labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
//             datasets: [{ data: performanceData.performance_trend }],
//           }}
//           width={350}
//           height={220}
//           yAxisSuffix="%"
//           chartConfig={{
//             backgroundColor: '#ffffff',
//             backgroundGradientFrom: '#f5f5f5',
//             backgroundGradientTo: '#f5f5f5',
//             decimalPlaces: 2,
//             color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
//           }}
//           style={styles.chart}
//         />
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   scrollContainer: {
//     flexGrow: 1,
//     padding: 20,
//     backgroundColor: '#F5F5F5',
//   },
//   container: {
//     flex: 1,
//   },
//   header: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#007AFF',
//   },
//   card: {
//     backgroundColor: '#fff',
//     padding: 20,
//     borderRadius: 10,
//     shadowColor: '#000',
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 3,
//     marginBottom: 20,
//   },
//   infoText: {
//     fontSize: 13,
//     marginBottom: 10,
//     color: '#333',
//     fontFamily: 'times new roman',
//   },
//   chart: {
//     marginVertical: 8,
//     borderRadius: 16,
//   },
// });

// export default OverallPerformance;
