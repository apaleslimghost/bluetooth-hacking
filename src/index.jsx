import React, {Component} from 'react';
import {render} from 'react-dom';

const serviceCache = {};

async function connectService(serviceUUID) {
	if(serviceCache[serviceUUID]) return serviceCache[serviceUUID];

	const device = await navigator.bluetooth.requestDevice({
		filters: [{services: [serviceUUID]}],
		optionalServices: [serviceUUID]
	});
	const server = await device.gatt.connect()
	return serviceCache[serviceUUID] = await server.getPrimaryService(serviceUUID);
};

async function getCharacteristicValue(service, characteristicUUID) {
	const characteristic = await service.getCharacteristic(characteristicUUID);
	return characteristic.readValue();
}

const steps = value => 0x100 * value.getUint8(2) + value.getUint8(1);

async function getSteps() {
	const service = await connectService(0xfee7);
	const value = await getCharacteristicValue(service, 0xfea1);
	return steps(value);
}

class App extends Component {
	state = {};

	render() {
		return <main>
			<button onClick={() => getSteps().then(steps => this.setState({steps}))}>Get steps</button>
			{this.state.steps}
		</main>;
	}
}

render(<App />, document.body);
