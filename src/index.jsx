import React, {Component} from 'react';
import {render} from 'react-dom';

async function connectService(device) {
	const server = await device.gatt.connect()
	return server.getPrimaryService(serviceUUID);
};

async function getCharacteristicValue(service, characteristicUUID) {
	const characteristic = await service.getCharacteristic(characteristicUUID);
	return characteristic.readValue();
}

const steps = value => 0x100 * value.getUint8(2) + value.getUint8(1);

async function getSteps(device, serviceUUID) {
	const value = await getCharacteristicValue(connectService(serviceUUID), 0xfea1);
	return steps(value);
}

class ConnectDevice extends Component {
	state = {};

	async connect() {
		const device = await navigator.bluetooth.requestDevice({
			filters: [{services: [this.props.serviceUUID]}],
			optionalServices: [this.props.serviceUUID],
		});

		this.setState({device});
		if(this.props.onconnect) this.props.onconnect(device);
	}

	render() {
		return <button onClick={() => this.connect()} disabled={!!this.state.device}>{this.state.device ? `Connected to ${this.state.device.name}` : 'Connect'}</button>;
	}
}

render(<ConnectDevice serviceUUID={0xfee7} />, document.body);
