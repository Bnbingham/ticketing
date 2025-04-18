import nats from 'node-nats-streaming';

class NatsWrapper {
  private _client?: nats.Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url });

    return new Promise<void>((resolve, reject) => {
      this.client.on('connect', () => {
        console.log('Connected to NATS');
        resolve();
      });
      this.client.on('error', (err) => {
        console.log('Error connecting to NATS');
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
