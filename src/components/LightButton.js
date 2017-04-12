import React, { PropTypes } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

const LightButton = ({ color, ...others }) => {
  return (
    <TouchableOpacity
      style={[styles.LightButton, { backgroundColor: color }]}
      {...others}
    />
  );
};

const styles = StyleSheet.create({
  LightButton: {
    height: 100,
    width: 100,
    margin: 10,
    borderRadius: 50
  }
});

LightButton.propTypes = {
  color: PropTypes.string
};

export default LightButton;
