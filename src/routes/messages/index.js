const MainMessageRouter = require("express").Router();

// Policies
const messagePolicy = require('../../policies/messagePolicies');

// Middleware
const { authenticate } = require("../../middlewares/authenticate");
import { channelVerification } from '../../middlewares/ChannelVerification';
const GDriveOauthClient = require('../../middlewares/GDriveOauthClient');
import URLEmbed from '../../middlewares/URLEmbed';
const serverChannelPermissions = require('../../middlewares/serverChannelPermissions');
const busboy = require('connect-busboy');
const rateLimit = require('../../middlewares/rateLimit');
const channelRateLimit = require('../../middlewares/channelRateLimit');
const permissions = require('../../utils/rolePermConstants');
const checkRolePerms = require('../../middlewares/checkRolePermissions');
const disAllowBlockedUser = require('../../middlewares/disAllowBlockedUser');
import fileMessage from './fileMessage';
import sendMessage from './sendOrUpdateMessage';


// get messages
MainMessageRouter.route("/channels/:channelID").get(
  authenticate(true),
  rateLimit({name: 'messages_load', expire: 60, requestsLimit: 120 }),
  channelVerification,
  require('./getMessages')
);

// get message
MainMessageRouter.route("/:messageID/channels/:channelID").get(
  authenticate(true),
  rateLimit({name: 'message_load', expire: 60, requestsLimit: 120 }),
  channelVerification,
  require('./getMessage')
);




// update message
MainMessageRouter.route("/:messageID/channels/:channelID").patch(
  authenticate(true),
  messagePolicy.update,
  rateLimit({name: 'message_update', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  fileMessage,
  sendMessage,
  URLEmbed
);

// send message
MainMessageRouter.route("/channels/:channelID").post(
  authenticate(true),
  messagePolicy.post,
  rateLimit({name: 'message_send', expire: 20, requestsLimit: 15 }),
  channelVerification,
  channelRateLimit,
  disAllowBlockedUser,
  serverChannelPermissions('send_message', true),
  checkRolePerms('Send Message', permissions.roles.SEND_MESSAGES),
  fileMessage,
  sendMessage,
  URLEmbed,
  //GDriveOauthClient,
  //busboy(),
 // require('./sendFileMessage'),
);

// typing
MainMessageRouter.route("/:channelID/typing").post(
  authenticate(true),
  rateLimit({name: 'message_typing', expire: 60, requestsLimit: 120 }),
  channelVerification,
  disAllowBlockedUser,
  serverChannelPermissions('send_message', true),
  checkRolePerms('Send Message', permissions.roles.SEND_MESSAGES),
  require('./sendTypingIndicator'),
);

module.exports = MainMessageRouter;
