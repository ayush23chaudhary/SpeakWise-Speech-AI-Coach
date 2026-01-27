// server/routes/onboarding.routes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User.model');

/**
 * POST /api/onboarding/complete
 * Save user's onboarding responses
 */
router.post('/complete', auth, async (req, res) => {
  try {
    console.log('📋 Completing onboarding for user:', req.user._id);
    
    const { user_purpose, stress_trigger } = req.body;
    
    // Validate required fields
    if (!user_purpose || !stress_trigger) {
      return res.status(400).json({
        success: false,
        message: 'Both user_purpose and stress_trigger are required'
      });
    }
    
    // Validate enum values
    const validPurposes = [
      'interviews_evaluations',
      'presentations_pitches',
      'everyday_conversations',
      'confidence_pressure'
    ];
    
    const validTriggers = [
      'first_30_seconds',
      'unexpected_questions',
      'being_judged',
      'continuous_speaking'
    ];
    
    if (!validPurposes.includes(user_purpose)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user_purpose value'
      });
    }
    
    if (!validTriggers.includes(stress_trigger)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid stress_trigger value'
      });
    }
    
    // Update user's onboarding data
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'onboarding.completed': true,
          'onboarding.user_purpose': user_purpose,
          'onboarding.stress_trigger': stress_trigger,
          'onboarding.completedAt': new Date()
        }
      },
      { new: true }
    );
    
    console.log('   ✅ Onboarding completed:', {
      user_purpose,
      stress_trigger
    });
    
    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: {
        onboarding: user.onboarding
      }
    });
    
  } catch (error) {
    console.error('❌ Error completing onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding',
      error: error.message
    });
  }
});

/**
 * GET /api/onboarding/status
 * Check if user has completed onboarding
 */
router.get('/status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('onboarding');
    
    res.json({
      success: true,
      data: {
        completed: user.onboarding?.completed || false,
        user_purpose: user.onboarding?.user_purpose || null,
        stress_trigger: user.onboarding?.stress_trigger || null
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching onboarding status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch onboarding status',
      error: error.message
    });
  }
});

/**
 * PUT /api/onboarding/update
 * Update user's purpose/trigger (accessible from settings)
 */
router.put('/update', auth, async (req, res) => {
  try {
    console.log('📝 Updating onboarding preferences for user:', req.user._id);
    
    const { user_purpose, stress_trigger } = req.body;
    
    const updateData = {};
    
    if (user_purpose) {
      const validPurposes = [
        'interviews_evaluations',
        'presentations_pitches',
        'everyday_conversations',
        'confidence_pressure'
      ];
      
      if (!validPurposes.includes(user_purpose)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user_purpose value'
        });
      }
      
      updateData['onboarding.user_purpose'] = user_purpose;
    }
    
    if (stress_trigger) {
      const validTriggers = [
        'first_30_seconds',
        'unexpected_questions',
        'being_judged',
        'continuous_speaking'
      ];
      
      if (!validTriggers.includes(stress_trigger)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid stress_trigger value'
        });
      }
      
      updateData['onboarding.stress_trigger'] = stress_trigger;
    }
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    );
    
    console.log('   ✅ Preferences updated');
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        onboarding: user.onboarding
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating onboarding:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

module.exports = router;
