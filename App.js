import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity  } from 'react-native';
// import { GLView, Camera, Permissions } from 'expo'
import { GLView } from 'expo-gl';
import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';

const vertSrc = `
void main(void) {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  gl_PointSize = 400.0;
}
`;

const fragSrc = `
void main(void) {
  gl_FragColor = vec4(4.0,0.0,0.0,1.0);
}
`;

let _initialized = false;
// lol

export default class App extends React.Component {
  state = {
    hasCameraPermission: null,
    type: Camera.Constants.Type.back,
  };

   async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status) {
      if (status || !status.hasCameraPermission) Permissions.getAsync(Permissions.CAMERA)
    }

    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {

    if (this.state.hasCameraPermission === null) {
      return <View />;
    } else if (this.state.hasCameraPermission === false) {
      return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No access to camera</Text>
      </View>;
    } else {
      return (
        <View style={{ flex: 1 }}>
          <Camera style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                }}
                onPress={() => {
                  this.setState({
                    type: this.state.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back,
                  });
                }}>
                <Text
                  style={{ fontSize: 18, marginBottom: 10, color: 'white' }}>
                  {' '}Flip{' '}
                </Text>
              </TouchableOpacity>
            </View>
          </Camera>
        <GLView
          style={{ width: 300, height: 300 }}
          onContextCreate={this._onContextCreate}
        />
      </View>
    );
  }
 }


  _onContextCreate = gl => {
    if (_initialized) {
      return;
    }

    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 1, 1, 1);

    // Compile vertex and fragment shader
    const vert = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vert, vertSrc);
    gl.compileShader(vert);
    const frag = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(frag, fragSrc);
    gl.compileShader(frag);

    // Link together into a program
    const program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);
    gl.useProgram(program);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);

    gl.flush();
    gl.endFrameEXP();
    _initialized = true;
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});