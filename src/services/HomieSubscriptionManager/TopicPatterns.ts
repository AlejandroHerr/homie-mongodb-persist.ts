enum TopicPatterns {
  DISCOVER_DEVICES = 'homie/+deviceId/$homie',
  DEVICE_ATTRIBUTES = 'homie/+deviceId/$+attribute',
  NODE_ATTRIBUTES = 'homie/+deviceId/+nodeId/$+attribute',
  PROPERTY_VALUE = 'homie/+deviceId/+nodeId/+propertyId',
  PROPERTY_ATTRIBUTES = 'homie/+deviceId/+nodeId/+propertyId/$+attribute',
}

export default TopicPatterns;
