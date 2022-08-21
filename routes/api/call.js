import express from 'express';
import { check, validationResult } from 'express-validator';
import authenticateUser from '../../middleware/auth.js';

import { sendRoomInvitation } from '../../utils/mailUtils.js';
import User from '../../models/User.js';

const router = express.Router();

// @route  POST/api/call
// @desc   send user call invitation
// access  Public
router.post(
  '/',
  [
    authenticateUser,
    [
      check('recipientId', 'Please include recipient id').not().isEmpty(),
      check('roomId', 'Please include room id to join').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientId, roomId } = req.body;

    try {
      //   const userFrom = await User.findById(callerId).select('-password');
      const userFrom = await User.findById(req.user.id).select('-password');
      const userTo = await User.findById(recipientId).select('-password');
      if (!userTo) {
        return res.status(404).json({ errors: [{ msg: 'User not exists' }] });
      }
      sendRoomInvitation({
        userFrom,
        userTo,
        roomId,
        handleError: (err) => {
          console.log(err);
          res.status(500).send('Server error');
        },
      });
      res.status(200).send('OK');
    } catch (err) {
      console.error(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

export default router;
