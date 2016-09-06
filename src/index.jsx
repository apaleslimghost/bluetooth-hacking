import React, {Component} from 'react';
import {render} from 'react-dom';

async function connectService(device, serviceUUID) {
	const server = await device.gatt.connect()
	return server.getPrimaryService(serviceUUID);
};

async function getCharacteristicValue(service, characteristicUUID) {
	const characteristic = await service.getCharacteristic(characteristicUUID);
	return characteristic.readValue();
}

const steps = value => 0x100 * value.getUint8(2) + value.getUint8(1);

async function getSteps(device, serviceUUID) {
	const value = await getCharacteristicValue(await connectService(device, serviceUUID), 0xfea1);
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

class Steps extends Component {
	state = {pending: false};

	async getSteps() {
		this.setState({pending: true});
		const steps = await getSteps(this.props.device, this.props.serviceUUID);
		this.setState({steps, pending: false});
	}

	render() {
		return <div>
			<button onClick={() => this.getSteps()}>Get steps</button>
			{this.state.steps} {this.state.pending && 'loading'}
		</div>
	}
}

class App extends Component {
	state = {};

	render() {
		return <div>
			<ConnectDevice serviceUUID={0xfee7} onconnect={device => this.setState({device})} />
			{this.state.device && <Steps device={this.state.device} serviceUUID={0xfee7} />}
		</div>
	}
}

render(<App />, document.body);
