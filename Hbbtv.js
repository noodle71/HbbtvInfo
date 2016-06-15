"use strict";
/**
 Constructor that gets all info from an Hbbtv.
 @author: Angel Fernández Camba noodle71@gmail.com
 @param {Object} settings. A common JSON Object with the following keys:
 <b>configInfo</b> {boolean} Default: true - To get device config info.
 Such as: preferredAudioLanguage, preferredSubtitleLanguage or countryId.

 <b>sysInfo</b> {boolean} Default: true - To get device system info.
 Such as: deviceID, modelName, vendorName, softwareVersion, hardwareVersion
 or vendorName.

 <b>keyset</b> {boolean} Default: true - To get device keyset codes.
 Such as: ALPHA, BLUE, GREEN, INFO, NAVIGATION, NUMERIC, OTHER, SCROLL, VCR
 , RED, value or YELLOW.

 <b>channel</b> {boolean} Default: true - To get current channel info.
 Such as: channelType, ccid, dsd, name, onid, sid or tsid.

 <b>channelsList</b> {boolean} Default: true - To get device channels list.

 Example:
 {
 'configInfo': false,
 'sysInfo': false,
 'keyset': false,
 'channel': false,
 'channelsList': false
 }

 @constructor
 **/

function HbbtvInf(settings) {
  this.settings = HbbtvInf.defaultSettings;
  for (var key in settings) {
    if (key in HbbtvInf.defaultSettings) {
      this.settings[key] = settings[key];
    } else {
      console.error('No setting named: ' + key);
    }
  }
  this._init();
}

//Global variables
HbbtvInf.defaultSettings = {
  'configInfo': true,
  'sysInfo': true,
  'keyset': true,
  'channel': true,
  'channelsList': true
};
HbbtvInf.OIPF_MGR = 'oipfApplicationManager';
HbbtvInf.OIPF_CNF = 'oipfConfiguration';
HbbtvInf.VIDEO_OBJ = 'video/broadcast';

var _proto = HbbtvInf.prototype;

/**
 Create mandatory objects in order to get data from device
 **/
_proto._init = function () {
  //Mandatory object
  this.oipfApplicationManager = this._createOipfObj(HbbtvInf.OIPF_MGR, true);
  if (this.oipfApplicationManager) {
    this.app = this.oipfApplicationManager.getOwnerApplication(document);
  }

  //Optional object
  if (this.oipfConfigurationObjectIsNeeded()) {
    this.oipfConfiguration = this._createOipfObj(HbbtvInf.OIPF_CNF, false);
  }

  //Optional object
  if (this.settings.channelsList) {
    this.videoObject = this._createVideoObject(false);
  }

  //Fill object with all info
  this.getAllInfo();
};

/**
 Get all hbbtv info
 **/
_proto.getAllInfo = function () {
  this.hbbtvInfo = {
    'configInfo': this.getConfigData(),
    'sysInfo': this.getSysData(),
    'keyset': this.getKeysetData(),
    'channel': this.getCurrentChannelData(),
    'channelsList': this.getChannelsList()
  };
  return this.hbbtvInfo;
};

/**
 Get device configuration data
 @return {Object}
 **/
_proto.getConfigData = function () {
  var data = {};
  if (this.settings.configInfo) {

    var cnf = this.oipfConfiguration && this.oipfConfiguration.configuration
      ? this.oipfConfiguration.configuration : null;

    if (cnf) {
      data = this._getValue(cnf, 'preferredAudioLanguage', data);
      data = this._getValue(cnf, 'preferredSubtitleLanguage', data);
      data = this._getValue(cnf, 'countryId', data);
    }
  }

  return data;
};

/**
 Get device configuration data
 @return {Object}
 **/
_proto.getSysData = function () {
  var data = {};
  if (this.settings.sysInfo) {

    var sys = this.oipfConfiguration && this.oipfConfiguration.localSystem
      ? this.oipfConfiguration.localSystem : null;

    if (sys) {
      data = this._getValue(sys, 'deviceID', data);
      data = this._getValue(sys, 'modelName', data);
      data = this._getValue(sys, 'vendorName', data);
      data = this._getValue(sys, 'softwareVersion', data);
      data = this._getValue(sys, 'hardwareVersion', data);
      data = this._getValue(sys, 'serialNumber', data);
    }
  }

  return data;
};

/**
 Get device current channel data
 @return {Object}
 **/
_proto.getCurrentChannelData = function () {
  var data = {};
  if (this.settings.channel) {

    var currentChannel = this.app && this.app.privateData
    && this.app.privateData.currentChannel
      ? this.app.privateData.currentChannel : null;

    if (currentChannel) {

      data = this._getValue(currentChannel, 'channelType', data);
      data = this._getValue(currentChannel, 'ccid', data);
      data = this._getValue(currentChannel, 'dsd', data);
      data = this._getValue(currentChannel, 'name', data);
      data = this._getValue(currentChannel, 'onid', data);
      data = this._getValue(currentChannel, 'sid', data);
      data = this._getValue(currentChannel, 'tsid', data);
    }
  }

  return data;
};

/**
 Get device keyset data
 @return {Object}
 **/
_proto.getKeysetData = function () {
  var data = {};
  if (this.settings.keyset) {

    var keyset = this.app && this.app.privateData
    && this.app.privateData.keyset
      ? this.app.privateData.keyset : null;

    if (keyset) {

      data = this._getValue(keyset, 'ALPHA', data);
      data = this._getValue(keyset, 'BLUE', data);
      data = this._getValue(keyset, 'GREEN', data);
      data = this._getValue(keyset, 'INFO', data);
      data = this._getValue(keyset, 'NAVIGATION', data);
      data = this._getValue(keyset, 'NUMERIC', data);
      data = this._getValue(keyset, 'OTHER', data);
      data = this._getValue(keyset, 'SCROLL', data);
      data = this._getValue(keyset, 'VCR', data);
      data = this._getValue(keyset, 'RED', data);
      data = this._getValue(keyset, 'value', data);
      data = this._getValue(keyset, 'YELLOW', data);
    }
  }

  return data;
};

/**
 Get device channels list
 @return {Object}
 **/
_proto.getChannelsList = function () {
  var data = [];
  if (this.settings.channelsList) {

    var chLst = this.videoObject && this.videoObject.getChannelConfig
    && this.videoObject.getChannelConfig()
    && this.videoObject.getChannelConfig().channelList
      ? this.videoObject.getChannelConfig().channelList : null;

    if (chLst) {
      for (var i = 0; i < chLst.length; i++) {
        if (chLst.item(i) && chLst.item(i).name) {
          data.push(chLst.item(i).name);
        }
      }
    }
  }

  return data;
};

/**
 Get a value of an object and set it to another object.
 @param {Object} - data - Object where you store the key and value
 @param {obj} - obj - Object you want to get the values
 @param {String} - key - Object key to get the value
 **/
_proto._getValue = function (data, obj, key) {
  data[key] = obj[key] ? obj[key] : '';
  return data;
};

/**
 Check if oipfConfiguration object is needed
 @return {Boolean}
 **/
_proto.oipfConfigurationObjectIsNeeded = function () {
  return this.settings.configInfo || this.settings.sysInfo;
};

/**
 Create a video object. If already exists, returns the existing one
 @param {Boolean} forceAppend - Force append object within body
 @return {Node} videoObject
 **/
_proto._createVideoObject = function (forceAppend) {
  return this._createObject(HbbtvInf.VIDEO_OBJ,
    {'type': HbbtvInf.VIDEO_OBJ}, forceAppend);
};

/**
 Create an oipf object. If already exists, returns the existing one
 @param {String} oipf - oipf object type
 @param {Boolean} forceAppend - Force append object within body
 @return {Node} oipfObject
 **/
_proto._createOipfObj = function (oipf, forceAppend) {
  return this._createObject('application/' + oipf, {
    'type': 'application/' + oipf,
    'style': 'position: absolute; left: 0px; top: 0px; width: 0px; height: 0px'
  }, forceAppend);
};

/**
 Create an object. If already exists, returns the existing one
 @param {String} type - Object type
 @param {String} properties - Object properties
 @param {Boolean} forceAppend - Force append object within body
 @return {Node} Object
 **/
_proto._createObject = function (type, properties, forceAppend) {
  var obj = this.getObjByType(type);
  return obj ? obj : this._createElement('object', properties, forceAppend);
};

/**
 Get an object by type
 @param {String} type - Object type
 @return {Node} Object
 **/
_proto.getObjByType = function (type) {
  return document.querySelector('[type="' + type + '"]');
};

/**
 Append a DOM element within the body
 @param {String}
 **/
_proto._appendInBody = function (element) {
  document.body.appendChild(element);
};

/**
 Create a DOM element
 @param {String} tag - Element tag name
 @param {Object} properties - Element properties
 @param {Boolean} forceAppend - Force append object within body
 @return {DomElement}
 **/
_proto._createElement = function (tag, properties, forceAppend) {
  var obj = document.createElement(tag);
  for (var key in properties) {
    obj.setAttribute(key, properties[key]);
  }
  if (forceAppend) {
    this._appendInBody(obj);
  }
  return obj;
};
