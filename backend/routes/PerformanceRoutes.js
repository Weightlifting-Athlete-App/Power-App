// const express = require('express');
// const router = express.Router();
// const OverallPerformance = require('../models/OverallPerformance');

// // Function to calculate overall performance
// const calculateOverallPerformance = (data) => {
//   const experience_score = (data.yrs_experience / data.age) * 100;
//   const strength_score = (data.lifted_weight / data.body_weight) * 100;
  
//   // Weighted formula
//   const overall_performance = (0.4 * strength_score) + 
//                               (0.3 * experience_score) + 
//                               (0.3 * data.predicted_performance);

//   return { overall_performance, strength_score, experience_score };
// };

// // Create or update overall performance data
// router.post('/OverallPerformance', async (req, res) => {
//   try {
//     const { username, age, age_start, yrs_experience, sex_encoded, body_weight, lifted_weight, predicted_performance } = req.body;

//     // Calculate scores
//     const { overall_performance, strength_score, experience_score } = calculateOverallPerformance(req.body);

//     let performance = await OverallPerformance.findOne({ username });

//     if (performance) {
//       // Update existing data
//       performance.age = age;
//       performance.age_start = age_start;
//       performance.yrs_experience = yrs_experience;
//       performance.sex_encoded = sex_encoded;
//       performance.body_weight = body_weight;
//       performance.lifted_weight = lifted_weight;
//       performance.predicted_performance = predicted_performance;
//       performance.overall_performance = overall_performance;
//       performance.strength_score = strength_score;
//       performance.experience_score = experience_score;
//     } else {
//       // Create new record
//       performance = new OverallPerformance({
//         username,
//         age,
//         age_start,
//         yrs_experience,
//         sex_encoded,
//         body_weight,
//         lifted_weight,
//         predicted_performance,
//         overall_performance,
//         strength_score,
//         experience_score,
//       });
//     }

//     const savedPerformance = await performance.save();
//     res.status(201).json(savedPerformance);
//   } catch (err) {
//     console.error("Error saving performance data:", err);
//     res.status(400).json({ message: err.message });
//   }
// });

// // Fetch overall performance data
// router.get('/OverallPerformance/:username', async (req, res) => {
//   try {
//     const performance = await OverallPerformance.findOne({ username: req.params.username });

//     if (!performance) {
//       return res.status(404).json({ message: "Performance data not found" });
//     }

//     res.json(performance);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;
