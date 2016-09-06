import React, {Component} from 'react';
import {render} from 'react-dom';

async function connectService(device, serviceUUID) {
	const server = await device.gatt.connect()
	return server.getPrimaryService(serviceUUID);
};

const steps = value => 0x100 * value.getUint8(2) + value.getUint8(1);

async function listenToCharacteristic(device, serviceUUID, characteristicUUID) {
	const service = await connectService(device, serviceUUID);
	const characteristic = await service.getCharacteristic(characteristicUUID);
	await characteristic.startNotifications();
	return characteristic;
}

class ConnectDevice extends Component {
	state = {};

	async connect() {
		try {
			const device = await navigator.bluetooth.requestDevice({
				filters: [{services: [this.props.serviceUUID]}],
				optionalServices: [this.props.serviceUUID],
			});

			this.setState({device});
			if(this.props.onconnect) this.props.onconnect(device);
		} catch(e) {
			if(this.props.onerror) this.props.onerror(e);
		}
	}

	render() {
		return <button onClick={() => this.connect()} disabled={!!this.state.device}>{this.state.device ? `Connected to ${this.state.device.name}` : 'Connect'}</button>;
	}
}

class Steps extends Component {
	state = {};

	async componentWillMount() {
		const characteristic = await listenToCharacteristic(this.props.device, this.props.serviceUUID, this.props.characteristicUUID)
		this.setState({
			steps: steps(await characteristic.readValue()),
		});

		characteristic.addEventListener('characteristicvaluechanged', ev => {
			this.setState({
				steps: steps(ev.target.value),
			});
		});
	}

	render() {
		return <div>
			{this.state.steps}
		</div>
	}
}

class App extends Component {
	state = {};

	render() {
		return <div>
			{this.state.error && <span style={{color: 'red'}}>{this.state.error.toString()}</span>}
			<ConnectDevice serviceUUID={0xfee7} onconnect={device => this.setState({device})} onerror={error => this.setState({error})} />
			{this.state.device && <Steps device={this.state.device} serviceUUID={0xfee7} characteristicUUID={0xfea1} onerror={error => this.setState({error})} />}
		</div>
	}
}

render(<App />, document.body);
