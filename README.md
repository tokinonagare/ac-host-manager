# ac-host-manager
Test a series of hosts access speed

# Installation
npm install --save ac-host-manager

# How to use
```
import ACHostManager from 'ac-host-manager'

const hosts = ['www.xxx.com', 'www.sss.com', 'www.bbb.com'];
const hostManager = new ACHostManager(hosts);
// fastest {delay: 1000, host: 'www.xxx.com', available: true, message: ''}
const fastest = await hostManager.getFastest();
const { host } = fastest;
const { available } = fastest;
