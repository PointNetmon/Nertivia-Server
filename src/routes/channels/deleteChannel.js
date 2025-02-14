import {Channels} from '../../models/Channels';
import { CHANNEL_DELETED } from '../../ServerEventNames';
module.exports = async (req, res, next) => {
  const { channel_id } = req.params;


  // check if channel exists
  let channel = await Channels
    .findOne({ channelID: channel_id, creator: req.user._id, server_id: { $exists: false } })
  if (!channel) {
    return res
    .status(404)
    .json({ message: "Invalid channel ID" });
  }


   await Channels.updateOne({ channelID: channel_id, creator: req.user._id }, {hide: true});



  res.json({ status: true, channelID: channel_id });
  req.io.in(req.user.id).emit(CHANNEL_DELETED, { channelID: channel_id });
};
